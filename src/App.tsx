import { useEffect, useMemo, useState } from 'react';
import { FiltersBar } from './components/FiltersBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { TimelineView } from './components/TimelineView';
import { TopBar } from './components/TopBar';
import { readFiltersFromUrl, useUrlFiltersSync } from './hooks/useUrlFilters';
import {
  filterAndSortTasks,
  selectClearFilters,
  selectMoveTaskToStatus,
  selectPresence,
  selectSetSortKey,
  selectSortKey,
  selectTickPresence,
  selectTasks,
  selectFilters,
  selectSetFilters,
  selectUpdateTaskStatus,
  useTaskStore
} from './store/useTaskStore';
import { ViewMode } from './types';
import { users } from './utils/dataGenerator';

function hasActiveFilters(filters: {
  statuses: unknown[];
  priorities: unknown[];
  assignees: unknown[];
  dueFrom?: string;
  dueTo?: string;
}) {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    !!filters.dueFrom ||
    !!filters.dueTo
  );
}

export default function App() {
  const allTasks = useTaskStore(selectTasks);
  const filters = useTaskStore(selectFilters);
  const presence = useTaskStore(selectPresence);
  const setFilters = useTaskStore(selectSetFilters);
  const clearFilters = useTaskStore(selectClearFilters);
  const sortKey = useTaskStore(selectSortKey);
  const setSortKey = useTaskStore(selectSetSortKey);
  const updateTaskStatus = useTaskStore(selectUpdateTaskStatus);
  const moveTaskToStatus = useTaskStore(selectMoveTaskToStatus);
  const tickPresence = useTaskStore(selectTickPresence);

  const [view, setView] = useState<ViewMode>('kanban');

  useEffect(() => {
    setFilters(readFiltersFromUrl());
    const onPop = () => setFilters(readFiltersFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setFilters]);

  useUrlFiltersSync(filters);

  useEffect(() => {
    const id = window.setInterval(() => tickPresence(), 1800);
    return () => window.clearInterval(id);
  }, [tickPresence]);

  const active = hasActiveFilters(filters);
  const viewTasks = useMemo(
    () => filterAndSortTasks(allTasks, filters, sortKey),
    [allTasks, filters, sortKey]
  );

  const statusCount = useMemo(
    () => ({
      todo: viewTasks.filter((t) => t.status === 'todo').length,
      inProgress: viewTasks.filter((t) => t.status === 'inProgress').length,
      inReview: viewTasks.filter((t) => t.status === 'inReview').length,
      done: viewTasks.filter((t) => t.status === 'done').length
    }),
    [viewTasks]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <TopBar presence={presence} />

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 flex flex-wrap gap-2">
          {(['kanban', 'list', 'timeline'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1.5 rounded-md text-sm capitalize border ${
                view === mode ? 'border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-300'
              }`}
              onClick={() => setView(mode)}
            >
              {mode}
            </button>
          ))}
          {view === 'list' && (
            <select
              id="list-sort"
              name="list-sort"
              className="ml-auto bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
              value={sortKey ?? ''}
              onChange={(e) =>
                setSortKey((e.target.value || null) as 'title' | 'priority' | 'dueDate' | null)
              }
            >
              <option value="">No Sort</option>
              <option value="title">Title (A-Z)</option>
              <option value="priority">Priority (Critical-Low)</option>
              <option value="dueDate">Due Date (Earliest)</option>
            </select>
          )}
        </div>

        <FiltersBar
          users={users}
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          hasActive={active}
        />

        {view === 'kanban' && (
          <KanbanView tasks={viewTasks} presence={presence} onMove={moveTaskToStatus} />
        )}
        {view === 'list' && (
          <>
            <ListView
              tasks={viewTasks}
              onStatusChange={updateTaskStatus}
              hasActiveFilters={active}
              onClearFilters={clearFilters}
            />
          </>
        )}
        {view === 'timeline' && <TimelineView tasks={viewTasks} />}

        <div className="text-xs text-slate-400">
          Shared dataset: {allTasks.length} visible tasks: {viewTasks.length}. Column totals - To Do:{' '}
          {statusCount.todo},
          In Progress: {statusCount.inProgress}, In Review: {statusCount.inReview}, Done:{' '}
          {statusCount.done}
        </div>
      </div>
    </div>
  );
}
