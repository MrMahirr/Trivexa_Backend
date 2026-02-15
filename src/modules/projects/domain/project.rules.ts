import { HttpException, HttpStatus } from '@nestjs/common';

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
    ON_HOLD: ['ACTIVE', 'CANCELLED'],
    COMPLETED: ['ACTIVE'], // reopen
    CANCELLED: ['DRAFT'],  // restart
};

export const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export class ProjectRules {
    static canChangeStatus(from: string, to: string): boolean {
        const allowed = STATUS_TRANSITIONS[from];
        return allowed ? allowed.includes(to) : false;
    }

    static validateStatusTransition(from: string, to: string): void {
        if (!this.canChangeStatus(from, to)) {
            throw new HttpException(
                `Cannot change project status from '${from}' to '${to}'. Allowed: ${STATUS_TRANSITIONS[from]?.join(', ') || 'none'}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}

export class ProjectNotFoundException extends HttpException {
    constructor() {
        super('Project not found', HttpStatus.NOT_FOUND);
    }
}

export class NotProjectMemberException extends HttpException {
    constructor() {
        super('You are not a member of this project', HttpStatus.FORBIDDEN);
    }
}

export class MemberAlreadyExistsException extends HttpException {
    constructor() {
        super('User is already a member of this project', HttpStatus.CONFLICT);
    }
}
