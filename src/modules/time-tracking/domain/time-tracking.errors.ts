import { HttpException, HttpStatus } from '@nestjs/common';

export class ActiveTimerExistsException extends HttpException {
  constructor() {
    super('You already have an active timer running', HttpStatus.CONFLICT);
  }
}

export class NoActiveTimerException extends HttpException {
  constructor() {
    super('No active timer found to stop', HttpStatus.NOT_FOUND);
  }
}

export class TimeEntryNotFoundException extends HttpException {
  constructor() {
    super('Time entry not found', HttpStatus.NOT_FOUND);
  }
}

export class TimeEntryAlreadyApprovedException extends HttpException {
  constructor() {
    super('Cannot modify an approved time entry', HttpStatus.FORBIDDEN);
  }
}
