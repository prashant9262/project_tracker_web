import { create } from 'zustand';
import { CollaborationPresence, Filters, Priority, Task, TaskStatus } from '../types';
import { generateTasks, users } from '../utils/dataGenerator';

const defaultFilters: Filters = {
  statuses: [],
  priorities: [],
  assignees: [],
  dueFrom: undefined,
  dueTo: undefined
};

const priorityRank: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

type SortKey = 'title' | 'priority' | 'dueDate' | null;

export interface TaskState {
  tasks: Task[];
  filters: Filters;
  sortKey: SortKey;
  presence: CollaborationPresence[];
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
  setSortKey: (key: SortKey) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  moveTaskToStatus: (taskId: string, status: TaskStatus) => void;
  tickPresence: () => void;
}

const initialTasks = generateTasks(540);
const simulatedUsers = users.slice(0, 4);

const initialPresence: CollaborationPresence[] = simulatedUsers.map((user, idx) => ({
  id: `presence-${user.id}`,
  name: user.name,
  initials: user.initials,
  color: user.color,
  taskId: initialTasks[idx * 2]?.id ?? initialTasks[0].id,
  active: idx < 3
}));

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: initialTasks,
  filters: defaultFilters,
  sortKey: null,
  presence: initialPresence,
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: defaultFilters }),
  setSortKey: (key) => set({ sortKey: key }),
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    })),
  moveTaskToStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    })),
  tickPresence: () => {
    const tasks = get().tasks;
    const now = Date.now();

    set((state) => {
      const max = state.presence.length;
      const activeCount = 2 + Math.floor(Math.random() * 3); // 2..4
      const activeIndices = new Set<number>();
      while (activeIndices.size < Math.min(activeCount, max)) {
        activeIndices.add(Math.floor(Math.random() * max));
      }

      const nextPresence = state.presence.map((person, idx) => {
        if (!activeIndices.has(idx)) {
          return { ...person, active: false, prevTaskId: undefined, movedAt: undefined };
        }

        const prevTaskId = person.taskId;
        const nextTaskId = tasks[Math.floor(Math.random() * tasks.length)]?.id ?? prevTaskId;
        const moved = prevTaskId !== nextTaskId;

        return {
          ...person,
          active: true,
          prevTaskId: moved ? prevTaskId : undefined,
          taskId: nextTaskId,
          movedAt: moved ? now : person.movedAt
        };
      });

      return { presence: nextPresence };
    });

    // Clear "prevTaskId" after a short time so fade-out avatars unmount.
    window.setTimeout(() => {
      set((state) => ({
        presence: state.presence.map((p) =>
          p.prevTaskId ? { ...p, prevTaskId: undefined, movedAt: undefined } : p
        )
      }));
    }, 420);
  }
}));

export const selectTasks = (state: TaskState) => state.tasks;
export const selectFilters = (state: TaskState) => state.filters;
export const selectSortKey = (state: TaskState) => state.sortKey;
export const selectPresence = (state: TaskState) => state.presence;
export const selectSetFilters = (state: TaskState) => state.setFilters;
export const selectClearFilters = (state: TaskState) => state.clearFilters;
export const selectSetSortKey = (state: TaskState) => state.setSortKey;
export const selectUpdateTaskStatus = (state: TaskState) => state.updateTaskStatus;
export const selectMoveTaskToStatus = (state: TaskState) => state.moveTaskToStatus;
export const selectTickPresence = (state: TaskState) => state.tickPresence;

export function selectFilteredTasks(state: TaskState): Task[] {
  return filterAndSortTasks(state.tasks, state.filters, state.sortKey);
}

export function filterAndSortTasks(
  tasks: Task[],
  filters: Filters,
  sortKey: SortKey
): Task[] {
  let filtered = tasks.filter((task) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
    if (filters.assignees.length > 0 && !filters.assignees.includes(task.assigneeId)) return false;
    if (filters.dueFrom && task.dueDate < filters.dueFrom) return false;
    if (filters.dueTo && task.dueDate > filters.dueTo) return false;
    return true;
  });

  if (sortKey === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey === 'priority') {
    filtered = [...filtered].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  } else if (sortKey === 'dueDate') {
    filtered = [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  return filtered;
}
