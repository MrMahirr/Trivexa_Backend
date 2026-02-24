import { HttpException, HttpStatus } from '@nestjs/common';

export class ContractNotFoundException extends HttpException {
  constructor() {
    super('Contract not found', HttpStatus.NOT_FOUND);
  }
}

export class InvalidContractDateException extends HttpException {
  constructor() {
    super('End date must be after start date', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidContractStatusException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
