import { HttpException, HttpStatus } from '@nestjs/common';

export class RoleNotFoundException extends HttpException {
  constructor(id?: string) {
    super(
      `Role ${id ? `with ID "${id}" ` : ''}not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
