import { Injectable } from '@nestjs/common';
import {
  NotificationType,
  NotificationChannel,
  NotificationPayload,
} from './notifications.types';

/**
 * NotificationFactory — Bildirim payload'ları oluşturmak için fabrika.
 * Her olay tipi için standart başlık ve mesaj şablonları sağlar.
 */
@Injectable()
export class NotificationFactory {
  createTaskAssigned(userId: string, taskTitle: string, assignerName: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Yeni Görev Atandı',
      message: `"${taskTitle}" görevi ${assignerName} tarafından size atandı.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET],
      metadata: { taskTitle, assignerName },
    };
  }

  createTicketCreated(userId: string, ticketSubject: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.TICKET_CREATED,
      title: 'Yeni Destek Bileti',
      message: `"${ticketSubject}" konulu yeni bir destek bileti oluşturuldu.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET],
      metadata: { ticketSubject },
    };
  }

  createTicketResolved(userId: string, ticketSubject: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.TICKET_RESOLVED,
      title: 'Bilet Çözüldü',
      message: `"${ticketSubject}" konulu destek bileti çözüldü.`,
      channels: [NotificationChannel.IN_APP],
      metadata: { ticketSubject },
    };
  }

  createInvoiceIssued(userId: string, invoiceNumber: string, amount: number): NotificationPayload {
    return {
      userId,
      type: NotificationType.INVOICE_ISSUED,
      title: 'Yeni Fatura Oluşturuldu',
      message: `${invoiceNumber} numaralı fatura (₺${amount.toLocaleString('tr-TR')}) oluşturuldu.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      metadata: { invoiceNumber, amount },
    };
  }

  createPaymentReceived(userId: string, amount: number, clientName: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Ödeme Alındı',
      message: `${clientName} firmasından ₺${amount.toLocaleString('tr-TR')} tutarında ödeme alındı.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET],
      metadata: { amount, clientName },
    };
  }

  createMeetingScheduled(userId: string, meetingTitle: string, date: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.MEETING_SCHEDULED,
      title: 'Toplantı Planlandı',
      message: `"${meetingTitle}" toplantısı ${date} tarihine planlandı.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      metadata: { meetingTitle, date },
    };
  }

  createContractSigned(userId: string, contractTitle: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.CONTRACT_SIGNED,
      title: 'Sözleşme İmzalandı',
      message: `"${contractTitle}" sözleşmesi başarıyla imzalandı.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      metadata: { contractTitle },
    };
  }

  createGeneric(userId: string, title: string, message: string, type: NotificationType = NotificationType.INFO): NotificationPayload {
    return {
      userId,
      type,
      title,
      message,
      channels: [NotificationChannel.IN_APP],
    };
  }
}
