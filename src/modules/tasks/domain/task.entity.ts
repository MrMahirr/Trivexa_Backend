export interface TaskAssigneeEntity {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface TaskEntity {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  assigneeIds: string[];
  assignees: TaskAssigneeEntity[];
  dueDate: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // optional joined fields
  assigneeEmail?: string;
  assigneeFirstName?: string;
  assigneeLastName?: string;
}

export const TASK_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'BLOCKED',
];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export class Task {
  private static parseAssignees(row: any): TaskAssigneeEntity[] {
    const value = row?.assignees;
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const typed = item as Record<string, unknown>;
        const userId = (typed.user_id || typed.userId) as string | undefined;
        if (!userId) {
          return null;
        }

        return {
          userId,
          email: (typed.email as string | null | undefined) ?? null,
          firstName:
            (typed.first_name as string | null | undefined) ??
            (typed.firstName as string | null | undefined) ??
            null,
          lastName:
            (typed.last_name as string | null | undefined) ??
            (typed.lastName as string | null | undefined) ??
            null,
        };
      })
      .filter((item): item is TaskAssigneeEntity => !!item);
  }

  static fromRow(row: any): TaskEntity {
    const assignees = Task.parseAssignees(row);
    const fallbackAssignee =
      assignees.length === 0 && row.assignee_id
        ? [
            {
              userId: row.assignee_id,
              email: row.assignee_email ?? null,
              firstName: row.assignee_first_name ?? null,
              lastName: row.assignee_last_name ?? null,
            },
          ]
        : assignees;

    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assigneeId: row.assignee_id,
      assigneeIds: fallbackAssignee.map((assignee) => assignee.userId),
      assignees: fallbackAssignee,
      dueDate: row.due_date,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assigneeEmail: row.assignee_email,
      assigneeFirstName: row.assignee_first_name,
      assigneeLastName: row.assignee_last_name,
    };
  }
}
