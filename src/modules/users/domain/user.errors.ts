import { NotFoundError } from "../../../shared/errors/not-found.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";

export class UserNotFoundException extends NotFoundError {
  constructor() {
    super('User not found');
  }
}

export class UserAlreadyExistsException extends ConflictError {
  constructor() {
    super('A user with this email already exists');
  }
}

export class CannotDeactivateSelfException extends ForbiddenError {
  constructor() {
    super('You cannot deactivate your own account');
  }
}

export class CannotChangeOwnRoleException extends ForbiddenError {
  constructor() {
    super('You cannot change your own role');
  }
}
