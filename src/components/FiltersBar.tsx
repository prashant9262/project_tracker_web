import { Filters, Priority, TaskStatus, User } from '../types';

interface Props {
  users: User[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
  hasActive: boolean;
}

const allStatuses: { label: string; value: TaskStatus }[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'inProgress' },
  { label: 'In Review', value: 'inReview' },
  { label: 'Done', value: 'done' }
];

const allPriorities: Priority[] = ['critical', 'high', 'medium', 'low'];

const toggle = <T extends string>(arr: T[], value: T): T[] =>
  arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

export function FiltersBar({ users, filters, onChange, onClear, hasActive }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {allStatuses.map((status) => (
          <button
            key={status.value}
            className={`text-xs px-2 py-1 rounded border ${
              filters.statuses.includes(status.value)
                ? 'border-cyan-400 text-cyan-300'
                : 'border-slate-600 text-slate-300'
            }`}
            onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, status.value) })}
          >
            {status.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {allPriorities.map((priority) => (
          <button
            key={priority}
            className={`text-xs px-2 py-1 rounded border capitalize ${
              filters.priorities.includes(priority)
                ? 'border-cyan-400 text-cyan-300'
                : 'border-slate-600 text-slate-300'
            }`}
            onClick={() => onChange({ ...filters, priorities: toggle(filters.priorities, priority) })}
          >
            {priority}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <button
            key={user.id}
            className={`text-xs px-2 py-1 rounded border ${
              filters.assignees.includes(user.id)
                ? 'border-cyan-400 text-cyan-300'
                : 'border-slate-600 text-slate-300'
            }`}
            onClick={() => onChange({ ...filters, assignees: toggle(filters.assignees, user.id) })}
          >
            {user.initials}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          id="filters-due-from"
          name="dueFrom"
          value={filters.dueFrom ?? ''}
          onChange={(e) => onChange({ ...filters, dueFrom: e.target.value || undefined })}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
        />
        <span className="text-slate-500 text-xs">to</span>
        <input
          type="date"
          id="filters-due-to"
          name="dueTo"
          value={filters.dueTo ?? ''}
          onChange={(e) => onChange({ ...filters, dueTo: e.target.value || undefined })}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
        />
        {hasActive && (
          <button className="text-xs px-2 py-1 rounded border border-rose-400 text-rose-300" onClick={onClear}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
