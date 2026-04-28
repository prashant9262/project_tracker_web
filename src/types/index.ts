export type TaskStatus = 'todo' | 'inProgress' | 'inReview' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
}

export interface Filters {
  statuses: TaskStatus[];
  priorities: Priority[];
  assignees: string[];
  dueFrom?: string;
  dueTo?: string;
}

export interface CollaborationPresence {
  id: string;
  name: string;
  initials: string;
  color: string;
  taskId: string;
  active: boolean;
  prevTaskId?: string;
  movedAt?: number;
}
