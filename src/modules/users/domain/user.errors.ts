import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super('User not found', HttpStatus.NOT_FOUND);
    }
}

export class UserAlreadyExistsException extends HttpException {
    constructor() {
        super('A user with this email already exists', HttpStatus.CONFLICT);
    }
}

export class CannotDeactivateSelfException extends HttpException {
    constructor() {
        super('You cannot deactivate your own account', HttpStatus.FORBIDDEN);
    }
}

export class CannotChangeOwnRoleException extends HttpException {
    constructor() {
        super('You cannot change your own role', HttpStatus.FORBIDDEN);
    }
}
