import { Module, Global } from '@nestjs/common';
import { SharedAuditService } from './audit.service';

@Global()
@Module({
  providers: [SharedAuditService],
  exports: [SharedAuditService],
})
export class SharedAuditModule {}
