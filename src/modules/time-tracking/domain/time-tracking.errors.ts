import { NotFoundError } from "../../../shared/errors/not-found.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";

export class ActiveTimerExistsException extends ConflictError {
  constructor() {
    super('You already have an active timer running');
  }
}

export class NoActiveTimerException extends NotFoundError {
  constructor() {
    super('No active timer found to stop');
  }
}

export class TimeEntryNotFoundException extends NotFoundError {
  constructor() {
    super('Time entry not found');
  }
}

export class TimeEntryAlreadyApprovedException extends ForbiddenError {
  constructor() {
    super('Cannot modify an approved time entry');
  }
}
