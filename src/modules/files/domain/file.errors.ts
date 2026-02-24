import { HttpException, HttpStatus } from '@nestjs/common';

export class FileNotFoundException extends HttpException {
    constructor() {
        super('File not found', HttpStatus.NOT_FOUND);
    }
}

export class FileRequiredException extends HttpException {
    constructor() {
        super('File is required', HttpStatus.BAD_REQUEST);
    }
}
