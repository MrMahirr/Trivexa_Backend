import { NotFoundError } from "../../../shared/errors/not-found.error";

export class DepartmentNotFoundException extends NotFoundError {
  constructor(id?: string) {
    super(`Department ${id ? `with ID "${id}" ` : ''}not found`);
  }
}
