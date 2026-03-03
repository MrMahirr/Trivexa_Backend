import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class PgErrorMapper {
  static map(error: any): void {
    if (!error.code) {
      throw error;
    }

    switch (error.code) {
      case '23505': // unique_violation
        throw new ConflictException('Resource already exists');
      case '23503': // foreign_key_violation
        throw new UnprocessableEntityException('Referenced resource not found');
      case '23502': // not_null_violation
        throw new BadRequestException('Missing required fields');
      case '23514': // check_violation
        throw new UnprocessableEntityException('Validation check failed');
      case '57014': // query_canceled
        throw new InternalServerErrorException('Query timeout');
      default:
        throw error;
    }
  }
}
