import { NotFoundError } from "../../../shared/errors/not-found.error";

export class MeetingNotFoundException extends NotFoundError {
  constructor() {
    super('Meeting not found');
  }
}
