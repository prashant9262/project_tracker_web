import { useEffect, useMemo, useRef, useState } from 'react';
import { AvatarStack } from './AvatarStack';
import { PresenceAvatarStack, type PresenceAvatar } from './PresenceAvatarStack';
import { users } from '../utils/dataGenerator';
import { CollaborationPresence, Priority, Task, TaskStatus } from '../types';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'inReview', label: 'In Review' },
  { key: 'done', label: 'Done' }
];

const priorityColor: Record<Priority, string> = {
  critical: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
  high: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
  medium: 'bg-sky-600/20 text-sky-300 border-sky-500/40',
  low: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
};

interface Props {
  tasks: Task[];
  presence: CollaborationPresence[];
  onMove: (taskId: string, status: TaskStatus) => void;
}

function dueLabel(dueDate: string): { text: string; className: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const nowKey = now.toISOString().slice(0, 10);
  if (dueDate === nowKey) return { text: 'Due Today', className: 'text-amber-300' };
  const dayDiff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > 7) return { text: `${dayDiff} days overdue`, className: 'text-rose-300' };
  if (dayDiff > 0) return { text: `Overdue`, className: 'text-rose-300' };
  return { text: dueDate, className: 'text-slate-300' };
}

export function KanbanView({ tasks, presence, onMove }: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const grouped = useMemo(() => {
    return COLUMNS.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => ({
        ...acc,
        [column.key]: tasks.filter((task) => task.status === column.key)
      }),
      { todo: [], inProgress: [], inReview: [], done: [] }
    );
  }, [tasks]);

  const dragMetaRef = useRef<{
    taskId: string;
    fromStatus: TaskStatus;
    pointerId: number;
    offsetX: number;
    offsetY: number;
    height: number;
    width: number;
    snapLeft: number;
    snapTop: number;
  } | null>(null);

  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [ghostTask, setGhostTask] = useState<Task | null>(null);
  const [hoverColumn, setHoverColumn] = useState<TaskStatus | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const ghostPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [isSnapping, setIsSnapping] = useState(false);
  const snapTimerRef = useRef<number | null>(null);

  const endDrag = (opts?: { cancelled?: boolean }) => {
    // Restore styles so the page behaves normally again.
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (snapTimerRef.current) {
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }

    dragMetaRef.current = null;
    setIsSnapping(false);
    setHoverColumn(null);
    setDragTaskId(null);
    setGhostTask(null);
    setGhostPos({ x: 0, y: 0 });

    // opts.cancelled exists only for clarity.
    void opts;
  };

  const getPresenceAvatarsForTask = (taskId: string): PresenceAvatar[] => {
    const onTask = presence.filter((p) => p.active && p.taskId === taskId);
    const exiting = presence.filter((p) => p.active && p.prevTaskId === taskId && p.taskId !== taskId);

    const inAvatars: PresenceAvatar[] = onTask.map((p) => ({
      id: p.id,
      initials: p.initials,
      color: p.color,
      kind: 'in'
    }));

    const outAvatars: PresenceAvatar[] = exiting.map((p) => ({
      id: p.id,
      initials: p.initials,
      color: p.color,
      kind: 'out'
    }));

    return [...inAvatars, ...outAvatars];
  };

  useEffect(() => {
    if (!dragTaskId) return;
    const meta = dragMetaRef.current;
    if (!meta) return;

    const handlePointerMove = (ev: PointerEvent) => {
      if (ev.pointerId !== meta.pointerId) return;
      if (isSnapping) return;

      ghostPosRef.current = { x: ev.clientX, y: ev.clientY };

      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          setGhostPos(ghostPosRef.current);
        });
      }

      // More reliable than `elementFromPoint().closest()` when the pointer is over
      // nested elements or scrollbars: detect which column bounding rect contains the pointer.
      const nextHover = (() => {
        const root = boardRef.current;
        if (!root) return null;
        const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-drop-column]'));
        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          if (
            ev.clientX >= rect.left &&
            ev.clientX <= rect.right &&
            ev.clientY >= rect.top &&
            ev.clientY <= rect.bottom
          ) {
            return (section.dataset.dropColumn as TaskStatus) ?? null;
          }
        }
        return null;
      })();
      setHoverColumn((prev) => (prev === nextHover ? prev : nextHover));
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== meta.pointerId) return;

      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(
        '[data-drop-column]'
      ) as HTMLElement | null;
      const dropStatus = (target?.dataset.dropColumn as TaskStatus | undefined) ?? null;

      if (dropStatus) {
        onMove(meta.taskId, dropStatus);
        endDrag();
        return;
      }

      // Snap back if dropped outside.
      setIsSnapping(true);
      setHoverColumn(null);
      snapTimerRef.current = window.setTimeout(() => endDrag({ cancelled: true }), 220);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragTaskId, isSnapping, onMove]);

  const onCardPointerDown = (task: Task, ev: React.PointerEvent<HTMLElement>) => {
    if (isSnapping) return;
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = ev.clientX - rect.left;
    const offsetY = ev.clientY - rect.top;

    dragMetaRef.current = {
      taskId: task.id,
      fromStatus: task.status,
      pointerId: ev.pointerId,
      offsetX,
      offsetY,
      height: rect.height,
      width: rect.width,
      snapLeft: rect.left,
      snapTop: rect.top
    };

    setDragTaskId(task.id);
    setGhostTask(task);
    setHoverColumn(task.status);
    setIsSnapping(false);

    ghostPosRef.current = { x: ev.clientX, y: ev.clientY };
    setGhostPos({ x: ev.clientX, y: ev.clientY });

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  };

  return (
    <div
      ref={boardRef}
      className="relative h-[calc(100vh-220px)] min-h-[520px] overflow-x-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {COLUMNS.map((column) => (
        <section
          key={column.key}
          data-drop-column={column.key}
          className={`rounded-xl border ${
            dragTaskId && hoverColumn === column.key
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-700 bg-slate-900'
          } p-3 flex flex-col min-h-0`}
        >
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">{column.label}</h3>
            <span className="text-xs rounded-full bg-slate-700 px-2 py-0.5 text-slate-200">
              {grouped[column.key].length}
            </span>
          </header>
          <div className="space-y-2 overflow-y-auto pr-1 min-h-0">
            {grouped[column.key].length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-400 text-center">
                No tasks here yet
              </div>
            )}
            {grouped[column.key].map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              const due = dueLabel(task.dueDate);

              const draggingThis = dragTaskId === task.id && dragMetaRef.current?.fromStatus === column.key;

              if (draggingThis && dragMetaRef.current) {
                return (
                  <div
                    key={`${task.id}-placeholder`}
                    className="rounded-lg border border-dashed border-slate-500 bg-slate-800/40"
                    style={{ height: dragMetaRef.current.height }}
                  />
                );
              }

              const presenceAvatars = getPresenceAvatarsForTask(task.id);

              return (
                <article
                  key={task.id}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-3 cursor-grab touch-none"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onCardPointerDown(task, e)}
                >
                  <div className="mb-2 text-sm text-slate-100">{task.title}</div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AvatarStack assigneeId={task.assigneeId} collaborativeInitials={[]} />
                      {presenceAvatars.length > 0 && (
                        <PresenceAvatarStack avatars={presenceAvatars} max={3} />
                      )}
                    </div>
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className={`mt-2 text-xs ${due.className}`}>{due.text}</div>
                  <div className="mt-1 text-[11px] text-slate-500 truncate">{assignee?.name}</div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {dragTaskId && ghostTask && dragMetaRef.current && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-cyan-400/40 bg-slate-800 shadow-2xl opacity-90"
          style={{
            width: dragMetaRef.current.width,
            height: dragMetaRef.current.height,
            left: isSnapping
              ? dragMetaRef.current.snapLeft
              : ghostPos.x - dragMetaRef.current.offsetX,
            top: isSnapping
              ? dragMetaRef.current.snapTop
              : ghostPos.y - dragMetaRef.current.offsetY,
            transition: isSnapping ? 'left 200ms ease, top 200ms ease' : undefined
          }}
        >
          <div className="p-3 h-full flex flex-col">
            <div className="mb-2 text-sm text-slate-100 truncate">{ghostTask.title}</div>
            <div className="flex items-center justify-between gap-3 mt-auto">
              <div className="flex items-center gap-2 min-w-0">
                <AvatarStack assigneeId={ghostTask.assigneeId} collaborativeInitials={[]} />
                {(() => {
                  const presenceAvatars = getPresenceAvatarsForTask(ghostTask.id);
                  return presenceAvatars.length > 0 ? (
                    <PresenceAvatarStack avatars={presenceAvatars} max={3} />
                  ) : null;
                })()}
              </div>
              <span
                className={`text-xs border px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[ghostTask.priority]}`}
              >
                {ghostTask.priority}
              </span>
            </div>
            <div className={`mt-2 text-xs ${dueLabel(ghostTask.dueDate).className}`}>{dueLabel(ghostTask.dueDate).text}</div>
          </div>
        </div>
      )}
    </div>
  );
}
