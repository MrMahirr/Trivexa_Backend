import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationUseCase } from '../usecases/create-notification.usecase';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class NotificationHandlers {
  private readonly logger = new Logger(NotificationHandlers.name);

  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  @OnEvent(SystemEvents.CONTRACT_CREATED, { async: true })
  async handleContractCreated(payload: any) {
    try {
      await this.createNotificationUseCase.execute({
        userId: payload.createdBy,
        type: 'CONTRACT_CREATED',
        title: 'Yeni Sozlesme',
        message: 'Yeni bir sozlesme olusturuldu ve onaya sunuldu.',
        metadata: {
          contractId: payload.contractId,
          clientId: payload.clientId,
        },
      });
      this.logger.debug(
        `Bildirim olusturuldu: CONTRACT_CREATED (User: ${payload.createdBy})`,
      );
    } catch (error) {
      this.logger.error(
        `CONTRACT_CREATED bildirimi basarisiz: ${error.message}`,
      );
    }
  }

  @OnEvent(SystemEvents.CONTRACT_SIGNED, { async: true })
  async handleContractSigned(payload: any) {
    try {
      const targetUserId = payload.signerId || payload.userId;
      if (!targetUserId) return;

      await this.createNotificationUseCase.execute({
        userId: targetUserId,
        type: 'CONTRACT_SIGNED',
        title: 'Sozlesme Imzalandi',
        message: 'Sozlesme basariyla imzalandi.',
        metadata: { contractId: payload.contractId },
      });
      this.logger.debug(`Bildirim olusturuldu: CONTRACT_SIGNED`);
    } catch (error) {
      this.logger.error(
        `CONTRACT_SIGNED bildirimi basarisiz: ${error.message}`,
      );
    }
  }

  @OnEvent(SystemEvents.PROJECT_CREATED, { async: true })
  async handleProjectCreated(payload: any) {
    try {
      await this.createNotificationUseCase.execute({
        userId: payload.createdBy,
        type: 'PROJECT_CREATED',
        title: 'Yeni Proje',
        message: 'Yeni proje olusturma islemi tamamlandi.',
        metadata: { projectId: payload.projectId },
      });
      this.logger.debug(`Bildirim olusturuldu: PROJECT_CREATED`);
    } catch (error) {
      this.logger.error(
        `PROJECT_CREATED bildirimi basarisiz: ${error.message}`,
      );
    }
  }

  @OnEvent('ticket.*', { async: true })
  async handleTicketEvents(payload: any) {
    try {
      if (!payload.createdBy && !payload.assignedTo) return;

      await this.createNotificationUseCase.execute({
        userId: payload.assignedTo || payload.createdBy,
        type: 'TICKET_UPDATE',
        title: 'Bilet Guncellemesi',
        message: 'Destek bileti uzerinde yeni bir islem gerceklestirildi.',
        metadata: { ticketId: payload.ticketId || payload.id },
      });
      this.logger.debug(`Bildirim olusturuldu: TICKET_UPDATE`);
    } catch (error) {
      this.logger.error(`TICKET_UPDATE bildirimi basarisiz: ${error.message}`);
    }
  }

  @OnEvent(SystemEvents.TASK_CREATED, { async: true })
  async handleTaskCreated(payload: any) {
    try {
      const assigneeIds: unknown[] = Array.isArray(payload.assigneeIds)
        ? payload.assigneeIds
        : payload.assigneeId
          ? [payload.assigneeId]
          : [];
      const targetUserIdsRaw: unknown[] = assigneeIds.length
        ? assigneeIds
        : payload.createdBy
          ? [payload.createdBy]
          : [];
      const targetUserIds = Array.from(
        new Set(
          targetUserIdsRaw.filter(
            (userId): userId is string =>
              typeof userId === 'string' && userId.trim().length > 0,
          ),
        ),
      );

      if (!targetUserIds.length) return;

      await Promise.all(
        targetUserIds.map((userId) =>
          this.createNotificationUseCase.execute({
            userId,
            type: 'TASK_CREATED',
            title: 'Yeni Gorev',
            message: `Size yeni bir gorev atandi: ${payload.title}`,
            metadata: { taskId: payload.taskId, projectId: payload.projectId },
          }),
        ),
      );
      this.logger.debug(`Bildirim olusturuldu: TASK_CREATED`);
    } catch (error) {
      this.logger.error(`TASK_CREATED bildirimi basarisiz: ${error.message}`);
    }
  }

  @OnEvent(SystemEvents.TASK_UPDATED, { async: true })
  async handleTaskUpdated(payload: any) {
    try {
      const assigneeIds: unknown[] = Array.isArray(payload.assigneeIds)
        ? payload.assigneeIds
        : payload.assigneeId
          ? [payload.assigneeId]
          : [];
      const targetUserIdsRaw: unknown[] = assigneeIds.length
        ? assigneeIds
        : payload.createdBy
          ? [payload.createdBy]
          : [];
      const targetUserIds = Array.from(
        new Set(
          targetUserIdsRaw.filter(
            (userId): userId is string =>
              typeof userId === 'string' && userId.trim().length > 0,
          ),
        ),
      );

      if (!targetUserIds.length) return;

      await Promise.all(
        targetUserIds.map((userId) =>
          this.createNotificationUseCase.execute({
            userId,
            type: 'TASK_UPDATED',
            title: 'Gorev Guncellendi',
            message: `Gorev detaylari guncellendi: ${payload.title}`,
            metadata: { taskId: payload.taskId, projectId: payload.projectId },
          }),
        ),
      );
      this.logger.debug(`Bildirim olusturuldu: TASK_UPDATED`);
    } catch (error) {
      this.logger.error(`TASK_UPDATED bildirimi basarisiz: ${error.message}`);
    }
  }

  @OnEvent(SystemEvents.INVOICE_CREATED, { async: true })
  async handleInvoiceCreated(payload: any) {
    try {
      const targetUserId = payload.createdBy;
      if (!targetUserId) return;

      await this.createNotificationUseCase.execute({
        userId: targetUserId,
        type: 'INVOICE_CREATED',
        title: 'Yeni Fatura',
        message: `Yeni bir fatura olusturuldu: ${payload.invoiceNumber}`,
        metadata: { invoiceId: payload.invoiceId },
      });
      this.logger.debug(`Bildirim olusturuldu: INVOICE_CREATED`);
    } catch (error) {
      this.logger.error(`INVOICE_CREATED bildirimi basarisiz: ${error.message}`);
    }
  }

  @OnEvent(SystemEvents.INVOICE_STATUS_UPDATED, { async: true })
  async handleInvoiceStatusUpdated(payload: any) {
    try {
      const targetUserId = payload.createdBy;
      if (!targetUserId) return;

      await this.createNotificationUseCase.execute({
        userId: targetUserId,
        type: 'INVOICE_STATUS_UPDATED',
        title: 'Fatura Durumu Degisti',
        message: `Faturanin yeni durumu: ${payload.status}`,
        metadata: { invoiceId: payload.invoiceId },
      });
      this.logger.debug(`Bildirim olusturuldu: INVOICE_STATUS_UPDATED`);
    } catch (error) {
      this.logger.error(
        `INVOICE_STATUS_UPDATED bildirimi basarisiz: ${error.message}`,
      );
    }
  }
}
