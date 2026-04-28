// src/utils/generateTasks.ts

import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { Task } from "../types/task";

const users = ["AR", "RS", "MK", "JP", "VK", "SN"];
const priorities = ["low", "medium", "high", "critical"] as const;
const statuses = ["todo", "inprogress", "review", "done"] as const;

export const generateTasks = (count: number): Task[] => {
  return Array.from({ length: count }).map(() => {
    const start = dayjs().subtract(Math.random() * 10, "day");
    const due = start.add(Math.random() * 10, "day");

    return {
      id: nanoid(),
      title: `Task ${Math.floor(Math.random() * 1000)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignee: users[Math.floor(Math.random() * users.length)],
      startDate: start.toISOString(),
      dueDate: due.toISOString(),
    };
  });
};