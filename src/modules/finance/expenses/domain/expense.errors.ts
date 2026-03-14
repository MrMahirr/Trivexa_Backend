import { NotFoundError } from "../../../../shared/errors/not-found.error";

export class ExpenseNotFoundException extends NotFoundError {
  constructor(id?: string) {
    super(`Expense ${id ? `${id} ` : ''}not found`);
  }
}
