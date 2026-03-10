import { Module } from '@nestjs/common';
import { LeaveRequestsController } from './api/leave-requests.controller';
import { LeaveRequestsService } from './application/leave-requests.service';
import { LeaveRequestsRepository } from './infrastructure/leave-requests.repository';

@Module({
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService, LeaveRequestsRepository],
  exports: [LeaveRequestsService],
})
export class LeavesModule {}
