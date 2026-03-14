import {
  DomainError,
  DomainErrorType,
} from '../../../shared/errors/domain.error';

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
      throw new DomainError(
        `Cannot change task status from '${from}' to '${to}'. Allowed: ${allowed?.join(', ') || 'none'}`,
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }
}

export class TaskNotFoundException extends DomainError {
  constructor() {
    super('Task not found');
  }
}

export class AssigneeNotMemberException extends DomainError {
  constructor() {
    super(
      'Assignee must be a member of the project',
      DomainErrorType.BUSINESS_RULE,
    );
  }
}

export class BlockerNotCompletedException extends DomainError {
  constructor() {
    super(
      'Cannot mark as DONE — blocking tasks are not yet completed',
      DomainErrorType.BUSINESS_RULE,
    );
  }
}
