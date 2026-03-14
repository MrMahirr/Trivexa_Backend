import { NotFoundError } from "../../../../shared/errors/not-found.error";

export class InvoiceNotFoundException extends NotFoundError {
  constructor(id?: string) {
    super(`Invoice ${id ? `with ID ${id} ` : ''}not found`);
  }
}
