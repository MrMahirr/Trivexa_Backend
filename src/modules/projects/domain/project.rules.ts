import {
  DomainError,
  DomainErrorType,
} from '../../../shared/errors/domain.error';
import { ProjectStatus } from '../../../shared/enums/project-status.enum';

// Valid status transitions based on ProjectStatus enum
const STATUS_TRANSITIONS: Record<string, string[]> = {
  [ProjectStatus.PLANNING]: [
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.IN_PROGRESS]: [
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.ON_HOLD]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.COMPLETED]: [ProjectStatus.ARCHIVED],
  [ProjectStatus.CANCELLED]: [ProjectStatus.PLANNING], // restart
  [ProjectStatus.ARCHIVED]: [],
};

export const VALID_STATUSES = Object.values(ProjectStatus);

export class ProjectRules {
  static canChangeStatus(from: string, to: string): boolean {
    const allowed = STATUS_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  static validateStatusTransition(from: string, to: string): void {
    if (!this.canChangeStatus(from, to)) {
      throw new DomainError(
        `Cannot change project status from '${from}' to '${to}'. Allowed: ${STATUS_TRANSITIONS[from]?.join(', ') || 'none'}`,
        DomainErrorType.BUSINESS_RULE,
      );
    }
  }
}

export class ProjectNotFoundException extends DomainError {
  constructor() {
    super('Project not found');
  }
}

export class NotProjectMemberException extends DomainError {
  constructor() {
    super('You are not a member of this project');
  }
}

export class MemberAlreadyExistsException extends DomainError {
  constructor() {
    super('User is already a member of this project');
  }
}
