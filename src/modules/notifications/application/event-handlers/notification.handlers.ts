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
        title: 'Yeni Sözleşme',
        message: 'Yeni bir sözleşme oluşturuldu ve onaya sunuldu.',
        metadata: {
          contractId: payload.contractId,
          clientId: payload.clientId,
        },
      });
      this.logger.debug(
        `Bildirim oluşturuldu: CONTRACT_CREATED (User: ${payload.createdBy})`,
      );
    } catch (error) {
      this.logger.error(
        `CONTRACT_CREATED bildirimi başarısız: ${error.message}`,
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
        title: 'Sözleşme İmzalandı',
        message: 'Sözleşme başarıyla imzalandı.',
        metadata: { contractId: payload.contractId },
      });
      this.logger.debug(`Bildirim oluşturuldu: CONTRACT_SIGNED`);
    } catch (error) {
      this.logger.error(
        `CONTRACT_SIGNED bildirimi başarısız: ${error.message}`,
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
        message: 'Yeni proje oluşturma işlemi tamamlandı.',
        metadata: { projectId: payload.projectId },
      });
      this.logger.debug(`Bildirim oluşturuldu: PROJECT_CREATED`);
    } catch (error) {
      this.logger.error(
        `PROJECT_CREATED bildirimi başarısız: ${error.message}`,
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
        title: 'Bilet Güncellemesi',
        message: 'Destek bileti üzerinde yeni bir işlem gerçekleştirildi.',
        metadata: { ticketId: payload.ticketId || payload.id },
      });
      this.logger.debug(`Bildirim oluşturuldu: TICKET_UPDATE`);
    } catch (error) {
      this.logger.error(`TICKET_UPDATE bildirimi başarısız: ${error.message}`);
    }
  }
}
