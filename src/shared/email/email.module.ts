import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EMAIL_SERVICE } from './interfaces/email-service.interface';
import { EmailJsProvider } from './providers/emailjs.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: EmailJsProvider,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
