import { HttpException, HttpStatus } from '@nestjs/common';

export class MeetingNotFoundException extends HttpException {
  constructor() {
    super('Meeting not found', HttpStatus.NOT_FOUND);
  }
}
