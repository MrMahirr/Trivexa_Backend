// Logger service
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: any, context?: string): void {
    console.log(`[${context || 'LOG'}] ${message}`);
  }

  error(message: any, trace?: string, context?: string): void {
    console.error(`[${context || 'ERROR'}] ${message}`, trace);
  }

  warn(message: any, context?: string): void {
    console.warn(`[${context || 'WARN'}] ${message}`);
  }

  debug(message: any, context?: string): void {
    console.debug(`[${context || 'DEBUG'}] ${message}`);
  }

  verbose(message: any, context?: string): void {
    console.log(`[${context || 'VERBOSE'}] ${message}`);
  }
}
