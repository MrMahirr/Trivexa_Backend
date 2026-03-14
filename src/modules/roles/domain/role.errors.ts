import { NotFoundError } from "../../../shared/errors/not-found.error";

export class RoleNotFoundException extends NotFoundError {
  constructor(id?: string) {
    super(`Role ${id ? `with ID "${id}" ` : ''}not found`);
  }
}
