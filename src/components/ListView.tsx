import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';
import { Task, TaskStatus } from '../types';
import { users } from '../utils/dataGenerator';

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

const ROW_HEIGHT = 56;
const DEFAULT_VIEWPORT_HEIGHT = 520;

function dueLabel(dueDate: string): { text: string; className: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const nowKey = now.toISOString().slice(0, 10);
  if (dueDate === nowKey) return { text: 'Due Today', className: 'text-amber-300' };
  const dayDiff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > 7) return { text: `${dayDiff} days overdue`, className: 'text-rose-300' };
  if (dayDiff > 0) return { text: 'Overdue', className: 'text-rose-300' };
  return { text: dueDate, className: 'text-slate-300' };
}

export function ListView({ tasks, onStatusChange, hasActiveFilters, onClearFilters }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTopRef = useRef(0);
  const rafScrollRef = useRef<number | null>(null);

  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => setViewportHeight(el.clientHeight || DEFAULT_VIEWPORT_HEIGHT);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const next = (e.currentTarget as HTMLDivElement).scrollTop;
    scrollTopRef.current = next;

    if (rafScrollRef.current == null) {
      rafScrollRef.current = window.requestAnimationFrame(() => {
        rafScrollRef.current = null;
        setScrollTop(scrollTopRef.current);
      });
    }
  };

  const { start, end, topPadding, totalHeight } = useVirtualList({
    itemCount: tasks.length,
    rowHeight: ROW_HEIGHT,
    scrollTop,
    viewportHeight,
    overscan: 5
  });

  const visible = useMemo(() => tasks.slice(start, end), [end, start, tasks]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900">
      <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr_1.1fr] px-4 py-3 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-700">
        <div>Title</div>
        <div>Assignee</div>
        <div>Priority</div>
        <div>Due</div>
        <div>Status</div>
      </div>
      <div ref={scrollerRef} className="overflow-auto h-[60vh] min-h-[520px]" onScroll={onScroll}>
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-slate-300 space-y-4">
            <div className="text-sm">No tasks match your filters.</div>
            {hasActiveFilters && onClearFilters && (
              <button
                className="mx-auto block rounded-md border border-cyan-400 px-3 py-1 text-sm text-cyan-300"
                onClick={onClearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${topPadding}px)` }}>
              {visible.map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[2.4fr_1fr_1fr_1fr_1.1fr] items-center px-4 border-b border-slate-800 hover:bg-slate-800/70"
                  style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
                >
                  <div className="text-sm text-slate-100">{task.title}</div>
                  <div className="text-sm text-slate-300">
                    {users.find((u) => u.id === task.assigneeId)?.initials ?? '--'}
                  </div>
                  <div className="text-sm capitalize text-slate-200">{task.priority}</div>
                  <div className={`text-sm ${dueLabel(task.dueDate).className}`}>{dueLabel(task.dueDate).text}</div>
                  <div>
                    <select
                      id={`task-status-${task.id}`}
                      name={`task-status-${task.id}`}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100"
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    >
                      <option value="todo">To Do</option>
                      <option value="inProgress">In Progress</option>
                      <option value="inReview">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
