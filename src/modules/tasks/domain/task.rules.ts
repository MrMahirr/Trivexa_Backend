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
  /**
   * Validate status transition is allowed
   */
  static validateStatusTransition(from: string, to: string): void {
    const allowed = TASK_STATUS_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new DomainError(
        `Cannot change task status from '${from}' to '${to}'. Allowed: ${allowed?.join(', ') || 'none'}`,
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }

  /**
   * Validate deadline is in the future
   */
  static validateDeadline(deadline: Date, currentDate: Date = new Date()): void {
    if (deadline < currentDate) {
      throw new DomainError(
        'Deadline cannot be in the past',
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }

  /**
   * Validate deadline is after start date
   */
  static validateDeadlineAfterStart(startDate: Date, deadline: Date): void {
    if (deadline <= startDate) {
      throw new DomainError(
        'Deadline must be after start date',
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }

  /**
   * Validate assignee has permission to be assigned
   * (must be member of project)
   */
  static validateAssigneePermission(
    assigneeId: string,
    projectMemberIds: string[],
  ): void {
    if (!projectMemberIds.includes(assigneeId)) {
      throw new AssigneeNotMemberException();
    }
  }

  /**
   * Validate task can be marked as DONE
   * (no blocking tasks)
   */
  static validateCanMarkDone(hasBlockingTasks: boolean): void {
    if (hasBlockingTasks) {
      throw new BlockerNotCompletedException();
    }
  }

  /**
   * Validate task priority is valid
   */
  static validatePriority(priority: string): void {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(priority)) {
      throw new DomainError(
        `Invalid priority '${priority}'. Must be one of: ${validPriorities.join(', ')}`,
        DomainErrorType.VALIDATION,
      );
    }
  }

  /**
   * Validate task can be deleted
   * (not in certain statuses)
   */
  static validateCanDelete(status: string): void {
    const nonDeletableStatuses = ['IN_PROGRESS', 'IN_REVIEW'];
    if (nonDeletableStatuses.includes(status)) {
      throw new DomainError(
        `Cannot delete task in '${status}' status. Complete or cancel the task first.`,
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }

  /**
   * Validate estimated hours is reasonable
   */
  static validateEstimatedHours(hours: number): void {
    if (hours < 0) {
      throw new DomainError(
        'Estimated hours cannot be negative',
        DomainErrorType.VALIDATION,
      );
    }

    if (hours > 1000) {
      throw new DomainError(
        'Estimated hours seems unreasonable (max: 1000 hours)',
        DomainErrorType.VALIDATION,
      );
    }
  }

  /**
   * Validate task can be reassigned
   */
  static validateCanReassign(status: string, hasTimeEntries: boolean): void {
    if (status === 'DONE' && hasTimeEntries) {
      throw new DomainError(
        'Cannot reassign completed task with time entries',
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
