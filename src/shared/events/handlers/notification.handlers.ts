import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemEvents } from '../event.constants';

/**
 * NotificationEventHandlers — Sistem event'lerini dinleyerek
 * otomatik bildirimler oluşturan handler'lar.
 *
 * Audit handler'ları gibi, bu handler'lar da EventEmitter üzerinden
 * gelen olayları asenkron olarak işler.
 */
@Injectable()
export class NotificationEventHandlers {
  private readonly logger = new Logger(NotificationEventHandlers.name);

  /**
   * Yeni proje oluşturulduğunda bildirim gönder
   */
  @OnEvent(SystemEvents.PROJECT_CREATED, { async: true })
  async handleProjectCreated(payload: {
    projectName: string;
    createdBy: string;
    teamMemberIds?: string[];
  }) {
    try {
      this.logger.debug(
        `Proje bildirim event'i alındı: "${payload.projectName}"`,
      );
      // Burada SharedNotificationsService.send() çağrılabilir
      // Modüler yapı gereği, bu handler daha sonra DI ile genişletilebilir
    } catch (error: any) {
      this.logger.error(
        `Proje bildirim handler hatası: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Yeni bilet oluşturulduğunda bildirim gönder
   */
  @OnEvent(SystemEvents.TICKET_CREATED, { async: true })
  async handleTicketCreated(payload: {
    ticketSubject: string;
    createdBy: string;
    assignedTo?: string;
  }) {
    try {
      this.logger.debug(
        `Bilet bildirim event'i alındı: "${payload.ticketSubject}"`,
      );
    } catch (error: any) {
      this.logger.error(
        `Bilet bildirim handler hatası: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Bilet çözüldüğünde bildirim gönder
   */
  @OnEvent(SystemEvents.TICKET_RESOLVED, { async: true })
  async handleTicketResolved(payload: {
    ticketSubject: string;
    resolvedBy: string;
    createdBy: string;
  }) {
    try {
      this.logger.debug(
        `Bilet çözüm bildirim event'i alındı: "${payload.ticketSubject}"`,
      );
    } catch (error: any) {
      this.logger.error(
        `Bilet çözüm bildirim handler hatası: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Sözleşme imzalandığında bildirim gönder
   */
  @OnEvent(SystemEvents.CONTRACT_SIGNED, { async: true })
  async handleContractSigned(payload: {
    contractTitle: string;
    signedBy: string;
  }) {
    try {
      this.logger.debug(
        `Sözleşme bildirim event'i alındı: "${payload.contractTitle}"`,
      );
    } catch (error: any) {
      this.logger.error(
        `Sözleşme bildirim handler hatası: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Toplantı ticket'a dönüştürüldüğünde bildirim gönder
   */
  @OnEvent(SystemEvents.MEETING_CONVERTED_TO_TICKET, { async: true })
  async handleMeetingConvertedToTicket(payload: {
    meetingTitle: string;
    ticketSubject: string;
    convertedBy: string;
  }) {
    try {
      this.logger.debug(
        `Toplantı→Bilet bildirim event'i: "${payload.meetingTitle}" → "${payload.ticketSubject}"`,
      );
    } catch (error: any) {
      this.logger.error(
        `Toplantı→Bilet bildirim handler hatası: ${error.message}`,
        error.stack,
      );
    }
  }
}
