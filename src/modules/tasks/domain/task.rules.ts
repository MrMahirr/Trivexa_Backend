import { HttpException, HttpStatus } from '@nestjs/common';

const TASK_STATUS_TRANSITIONS: Record<string, string[]> = {
    TODO: ['IN_PROGRESS', 'BLOCKED'],
    IN_PROGRESS: ['IN_REVIEW', 'BLOCKED', 'TODO'],
    IN_REVIEW: ['DONE', 'IN_PROGRESS'],
    BLOCKED: ['TODO', 'IN_PROGRESS'],
    DONE: ['TODO'], // reopen
};

export class TaskRules {
    static validateStatusTransition(from: string, to: string): void {
        const allowed = TASK_STATUS_TRANSITIONS[from];
        if (!allowed || !allowed.includes(to)) {
            throw new HttpException(
                `Cannot change task status from '${from}' to '${to}'. Allowed: ${allowed?.join(', ') || 'none'}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}

export class TaskNotFoundException extends HttpException {
    constructor() {
        super('Task not found', HttpStatus.NOT_FOUND);
    }
}

export class AssigneeNotMemberException extends HttpException {
    constructor() {
        super('Assignee must be a member of the project', HttpStatus.BAD_REQUEST);
    }
}

export class BlockerNotCompletedException extends HttpException {
    constructor() {
        super('Cannot mark as DONE — blocking tasks are not yet completed', HttpStatus.BAD_REQUEST);
    }
}
