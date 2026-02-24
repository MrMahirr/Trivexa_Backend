import { HttpException, HttpStatus } from '@nestjs/common';

export class DepartmentNotFoundException extends HttpException {
    constructor(id?: string) {
        super(`Department ${id ? `with ID "${id}" ` : ''}not found`, HttpStatus.NOT_FOUND);
    }
}
