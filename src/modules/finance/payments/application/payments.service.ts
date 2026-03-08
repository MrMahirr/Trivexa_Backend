import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabasePool } from '../../../../database/pool';
import { CreatePaymentDto } from '../api/dto/create-payment.dto';
import { UpdatePaymentDto } from '../api/dto/update-payment.dto';
import { RefundPaymentDto } from '../api/dto/refund-payment.dto';
import {
  PaymentAuditFilters,
  PaymentAuditPage,
  PaymentEntity,
} from '../domain/payment.entity';
import { ProcessPaymentUseCase } from './usecases/process-payment.usecase';
import { ListPaymentsByInvoiceUseCase } from './usecases/list-payments-by-invoice.usecase';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { InvoicesRepository } from '../../invoices/infrastructure/invoices.repository';
import { InvoiceEntity, InvoiceStatus } from '../../invoices/domain/invoice.entity';
import { PoolClient } from 'pg';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';
import { Role } from '../../../../shared/enums/role.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dbPool: DatabasePool,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly invoicesRepository: InvoicesRepository,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly listPaymentsByInvoiceUseCase: ListPaymentsByInvoiceUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentEntity> {
    const payment = await this.processPaymentUseCase.execute(
      createPaymentDto,
      userId,
    );

    this.emitPaymentAudit({
      action: 'CREATE',
      userId,
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      details: {
        eventType: 'PAYMENT_CREATED',
        invoiceId: payment.invoiceId,
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
        paymentDate: payment.paymentDate,
        reference: payment.reference ?? null,
        notes: payment.notes ?? null,
        receiptUrl: payment.receiptUrl ?? null,
      },
    });

    return payment;
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]> {
    return this.listPaymentsByInvoiceUseCase.execute(invoiceId);
  }

  async update(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
    userId: string,
  ): Promise<PaymentEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existing = await this.paymentsRepository.findById(paymentId, client);
      if (!existing) {
        throw new NotFoundException('Payment not found');
      }

      const updated = await this.paymentsRepository.update(
        paymentId,
        {
          amount: updatePaymentDto.amount,
          method: updatePaymentDto.method,
          paymentDate: updatePaymentDto.paymentDate
            ? new Date(updatePaymentDto.paymentDate)
            : undefined,
          reference: updatePaymentDto.reference,
          notes: updatePaymentDto.notes,
          receiptUrl: updatePaymentDto.receiptUrl,
        },
        client,
      );

      if (!updated) {
        throw new NotFoundException('Payment not found');
      }

      await this.syncInvoiceStatus(existing.invoiceId, client);

      await client.query('COMMIT');

      this.emitPaymentAudit({
        action: 'UPDATE',
        userId,
        paymentId: updated.id,
        invoiceId: existing.invoiceId,
        details: {
          eventType: 'PAYMENT_UPDATED',
          invoiceId: existing.invoiceId,
          paymentId: updated.id,
          changedFields: [
            updatePaymentDto.amount !== undefined ? 'amount' : null,
            updatePaymentDto.method !== undefined ? 'method' : null,
            updatePaymentDto.paymentDate !== undefined ? 'paymentDate' : null,
            updatePaymentDto.reference !== undefined ? 'reference' : null,
            updatePaymentDto.notes !== undefined ? 'notes' : null,
            updatePaymentDto.receiptUrl !== undefined ? 'receiptUrl' : null,
          ].filter(Boolean),
          before: {
            amount: existing.amount,
            method: existing.method,
            paymentDate: existing.paymentDate,
            reference: existing.reference ?? null,
            notes: existing.notes ?? null,
            receiptUrl: existing.receiptUrl ?? null,
          },
          after: {
            amount: updated.amount,
            method: updated.method,
            paymentDate: updated.paymentDate,
            reference: updated.reference ?? null,
            notes: updated.notes ?? null,
            receiptUrl: updated.receiptUrl ?? null,
          },
        },
      });

      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async remove(paymentId: string, userId: string): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existing = await this.paymentsRepository.findById(paymentId, client);
      if (!existing) {
        throw new NotFoundException('Payment not found');
      }

      const removed = await this.paymentsRepository.remove(paymentId, client);
      if (!removed) {
        throw new NotFoundException('Payment not found');
      }

      await this.syncInvoiceStatus(existing.invoiceId, client);

      await client.query('COMMIT');

      this.emitPaymentAudit({
        action: 'DELETE',
        userId,
        paymentId: existing.id,
        invoiceId: existing.invoiceId,
        details: {
          eventType: 'PAYMENT_DELETED',
          invoiceId: existing.invoiceId,
          paymentId: existing.id,
          deletedPayment: {
            amount: existing.amount,
            method: existing.method,
            paymentDate: existing.paymentDate,
            reference: existing.reference ?? null,
            notes: existing.notes ?? null,
            receiptUrl: existing.receiptUrl ?? null,
          },
        },
      });

      try {
        const targetUserIds =
          await this.resolveFinanceNotificationTargets(userId);
        const [invoice, actorName] = await Promise.all([
          this.invoicesRepository.findById(existing.invoiceId),
          this.paymentsRepository.findUserDisplayNameById(userId),
        ]);
        this.eventEmitter.emit(SystemEvents.PAYMENT_DELETED, {
          targetUserIds,
          actorUserId: userId,
          actorName,
          invoiceId: existing.invoiceId,
          invoiceNumber: invoice?.invoiceNumber,
          paymentId: existing.id,
          amount: existing.amount,
        });
      } catch {
        // Notification failures should not break a successful delete transaction.
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async refund(
    paymentId: string,
    refundPaymentDto: RefundPaymentDto,
    userId: string,
  ): Promise<PaymentEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const original = await this.paymentsRepository.findById(paymentId, client);
      if (!original) {
        throw new NotFoundException('Payment not found');
      }

      if (original.amount <= 0) {
        throw new BadRequestException('Refund can only be created from positive payments');
      }

      const refundAmount = refundPaymentDto.amount ?? original.amount;
      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }
      if (refundAmount > original.amount) {
        throw new BadRequestException('Refund amount cannot exceed original payment amount');
      }

      const referenceBase = original.reference
        ? `${original.reference}-REFUND`
        : `REFUND-${original.id.slice(0, 8)}`;
      const reason = refundPaymentDto.reason?.trim();

      const refund = await this.paymentsRepository.create(
        {
          invoiceId: original.invoiceId,
          amount: -Math.abs(refundAmount),
          method: original.method,
          paymentDate: refundPaymentDto.paymentDate
            ? new Date(refundPaymentDto.paymentDate)
            : new Date(),
          reference: referenceBase,
          notes: reason
            ? `Iade: ${reason}`
            : `Iade islemi (kaynak odeme: ${original.id})`,
          receiptUrl: refundPaymentDto.receiptUrl?.trim() || undefined,
          recordedBy: userId,
        },
        client,
      );

      await this.syncInvoiceStatus(original.invoiceId, client);

      await client.query('COMMIT');

      this.emitPaymentAudit({
        action: 'OTHER',
        userId,
        paymentId: refund.id,
        invoiceId: original.invoiceId,
        details: {
          eventType: 'PAYMENT_REFUND_CREATED',
          invoiceId: original.invoiceId,
          sourcePaymentId: original.id,
          refundPaymentId: refund.id,
          refundAmount: refund.amount,
          method: refund.method,
          paymentDate: refund.paymentDate,
          reason: reason ?? null,
          receiptUrl: refund.receiptUrl ?? null,
        },
      });

      try {
        const targetUserIds =
          await this.resolveFinanceNotificationTargets(userId);
        const [invoice, actorName] = await Promise.all([
          this.invoicesRepository.findById(original.invoiceId),
          this.paymentsRepository.findUserDisplayNameById(userId),
        ]);
        this.eventEmitter.emit(SystemEvents.PAYMENT_REFUND_CREATED, {
          targetUserIds,
          actorUserId: userId,
          actorName,
          invoiceId: original.invoiceId,
          invoiceNumber: invoice?.invoiceNumber,
          sourcePaymentId: original.id,
          refundPaymentId: refund.id,
          amount: Math.abs(refund.amount),
        });
      } catch {
        // Notification failures should not break a successful refund transaction.
      }

      return refund;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async syncInvoiceStatus(
    invoiceId: string,
    client: PoolClient,
  ): Promise<void> {
    const invoice = await this.invoicesRepository.findById(invoiceId, client);
    if (!invoice) return;

    const totalPaid = await this.paymentsRepository.sumPaymentsByInvoiceId(
      invoiceId,
      client,
    );
    const nextStatus = this.resolveInvoiceStatus(invoice, totalPaid);

    if (nextStatus !== invoice.status) {
      await this.invoicesRepository.updateStatus(invoiceId, nextStatus, client);
    }
  }

  private resolveInvoiceStatus(
    invoice: InvoiceEntity,
    totalPaid: number,
  ): InvoiceStatus {
    if (invoice.status === InvoiceStatus.CANCELLED) {
      return InvoiceStatus.CANCELLED;
    }

    if (totalPaid >= invoice.total) {
      return InvoiceStatus.PAID;
    }

    if (totalPaid > 0) {
      return InvoiceStatus.PARTIALLY_PAID;
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      return InvoiceStatus.DRAFT;
    }

    if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      return InvoiceStatus.OVERDUE;
    }

    return InvoiceStatus.SENT;
  }

  async getAuditByInvoice(
    invoiceId: string,
    filters?: PaymentAuditFilters,
  ): Promise<PaymentAuditPage> {
    return this.paymentsRepository.findAuditByInvoiceId(invoiceId, filters);
  }

  private emitPaymentAudit(payload: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OTHER';
    userId?: string;
    paymentId: string;
    invoiceId: string;
    details: Record<string, any>;
  }): void {
    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      entityName: 'PAYMENT',
      entityId: payload.paymentId,
      action: payload.action,
      userId: payload.userId,
      details: {
        ...payload.details,
        invoiceId: payload.invoiceId,
      },
    });
  }

  private async resolveFinanceNotificationTargets(
    actorUserId?: string,
  ): Promise<string[]> {
    const financeLeads = await this.paymentsRepository.findUserIdsByRoles([
      Role.ADMIN,
      Role.MANAGER,
      Role.ACCOUNTING,
      Role.SOCIAL_MEDIA,
      'SEO',
    ]);

    return Array.from(
      new Set(
        [...financeLeads, actorUserId]
          .filter((value): value is string => !!value && value.length > 0),
      ),
    );
  }
}
