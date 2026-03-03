import { HttpException, HttpStatus } from '@nestjs/common';

export class InvoiceNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      `Invoice ${id ? `with ID ${id} ` : ''}not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
