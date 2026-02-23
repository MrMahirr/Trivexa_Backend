import { Injectable } from '@nestjs/common';
import { CreateNotificationUseCase } from '../usecases/create-notification.usecase';

@Injectable()
export class NotificationService {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async send(
    userId: string,
    title: string,
    message: string,
    type: string = 'INFO',
    metadata?: Record<string, any>,
  ) {
    await this.createNotificationUseCase.execute({
      userId,
      title,
      message,
      type,
      metadata,
    });
  }

  async notifyTaskAssigned(userId: string, taskTitle: string, taskId: string) {
    await this.send(
      userId,
      'New Task Assigned',
      `You have been assigned to task: ${taskTitle}`,
      'TASK_ASSIGNED',
      { taskId },
    );
  }

  async notifyInvoiceSent(
    userId: string,
    invoiceNumber: string,
    invoiceId: string,
  ) {
    await this.send(
      userId,
      'Invoice Sent',
      `Invoice ${invoiceNumber} has been sent.`,
      'INVOICE_SENT',
      { invoiceId },
    );
  }

  async notifyPaymentReceived(
    userId: string,
    invoiceNumber: string,
    amount: number,
  ) {
    await this.send(
      userId,
      'Payment Received',
      `Payment of ${amount} received for Invoice ${invoiceNumber}.`,
      'PAYMENT_RECEIVED',
      { invoiceNumber },
    );
  }
}
