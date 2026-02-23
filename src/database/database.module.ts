import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { DatabasePool } from './pool';
import { TransactionManager } from './transaction';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [DatabasePool, TransactionManager],
  exports: [DatabasePool, TransactionManager],
})
export class DatabaseModule {}
