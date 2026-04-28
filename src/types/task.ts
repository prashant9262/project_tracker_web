// src/types/task.ts

export type Status = "todo" | "inprogress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  startDate?: string;
  dueDate: string;
}