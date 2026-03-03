import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token has expired');
  }
}

export class TokenRevokedException extends UnauthorizedException {
  constructor() {
    super('Token has been revoked');
  }
}

export class AccountDeactivatedException extends ForbiddenException {
  constructor() {
    super('Account has been deactivated');
  }
}
