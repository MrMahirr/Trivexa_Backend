import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseNotFoundException extends HttpException {
  constructor(id?: string) {
    super(`Expense ${id ? `${id} ` : ''}not found`, HttpStatus.NOT_FOUND);
  }
}
