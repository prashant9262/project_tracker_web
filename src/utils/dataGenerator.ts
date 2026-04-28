import { Priority, Task, TaskStatus, User } from '../types';

const TITLES = [
  'Implement authentication flow',
  'Fix timeline rendering bug',
  'Refactor task detail panel',
  'Optimize list row rendering',
  'Write API integration tests',
  'Design sprint planning board',
  'Update dashboard widgets',
  'Investigate memory spike',
  'Create release checklist',
  'Review onboarding journey'
];

const STATUSES: TaskStatus[] = ['todo', 'inProgress', 'inReview', 'done'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export const users: User[] = [
  { id: 'u1', name: 'Ava Kim', initials: 'AK', color: 'bg-pink-500' },
  { id: 'u2', name: 'Noah Lee', initials: 'NL', color: 'bg-indigo-500' },
  { id: 'u3', name: 'Mia Shah', initials: 'MS', color: 'bg-emerald-500' },
  { id: 'u4', name: 'Liam Chen', initials: 'LC', color: 'bg-amber-500' },
  { id: 'u5', name: 'Emma Roy', initials: 'ER', color: 'bg-sky-500' },
  { id: 'u6', name: 'Ethan Park', initials: 'EP', color: 'bg-violet-500' }
];

const rand = (max: number): number => Math.floor(Math.random() * max);

const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

export function generateTasks(count = 520): Task[] {
  const now = new Date();
  const result: Task[] = [];

  for (let i = 0; i < count; i += 1) {
    const title = `${TITLES[rand(TITLES.length)]} #${i + 1}`;
    const assignee = users[rand(users.length)];
    const status = STATUSES[rand(STATUSES.length)];
    const priority = PRIORITIES[rand(PRIORITIES.length)];
    const startOffset = rand(40) - 15;
    const dueOffset = startOffset + rand(25) + 1;
    const start = new Date(now);
    const due = new Date(now);
    start.setDate(now.getDate() + startOffset);
    due.setDate(now.getDate() + dueOffset);

    result.push({
      id: `task-${i + 1}`,
      title,
      assigneeId: assignee.id,
      status,
      priority,
      startDate: rand(7) === 0 ? undefined : toDateKey(start),
      dueDate: toDateKey(due)
    });
  }

  // Inject explicit edge cases
  const today = toDateKey(now);
  const overdue = new Date(now);
  overdue.setDate(now.getDate() - 10);
  result[0] = { ...result[0], dueDate: today, status: 'inProgress', priority: 'critical' };
  result[1] = { ...result[1], dueDate: toDateKey(overdue), status: 'todo', priority: 'high' };
  result[2] = { ...result[2], startDate: undefined, status: 'inReview' };

  return result;
}
