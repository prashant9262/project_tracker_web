import { Priority, Task } from '../types';

interface Props {
  tasks: Task[];
}

const DAY_WIDTH = 36;

const colorMap: Record<Priority, string> = {
  critical: 'bg-rose-500',
  high: 'bg-amber-500',
  medium: 'bg-sky-500',
  low: 'bg-emerald-500'
};

const toDate = (value?: string) => (value ? new Date(value) : undefined);

export function TimelineView({ tasks }: Props) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const days = monthEnd.getDate();
  const todayOffset = now.getDate() - 1;
  const width = days * DAY_WIDTH;

  const overlapping = tasks.filter((task) => {
    const start = toDate(task.startDate) ?? toDate(task.dueDate) ?? monthStart;
    const due = toDate(task.dueDate) ?? monthEnd;
    return !(due < monthStart || start > monthEnd);
  });

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-auto">
      <div className="min-w-max" style={{ width }}>
        <div className="sticky top-0 z-10 grid bg-slate-900 border-b border-slate-700" style={{ gridTemplateColumns: `repeat(${days}, ${DAY_WIDTH}px)` }}>
          {Array.from({ length: days }).map((_, idx) => (
            <div key={idx} className="text-xs text-slate-400 p-2 border-r border-slate-800 text-center">
              {idx + 1}
            </div>
          ))}
        </div>
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-300/70"
            style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
          />
          {overlapping.map((task) => {
            const start = toDate(task.startDate) ?? toDate(task.dueDate) ?? monthStart;
            const due = toDate(task.dueDate) ?? monthEnd;
            const clampedStart = start < monthStart ? monthStart : start;
            const clampedEnd = due > monthEnd ? monthEnd : due;
            const startOffset = Math.max(0, clampedStart.getDate() - 1);
            const span = Math.max(1, clampedEnd.getDate() - clampedStart.getDate() + 1);
            return (
              <div key={task.id} className="relative border-b border-slate-800 h-10 px-2">
                <div
                  className={`absolute top-1.5 h-7 rounded ${colorMap[task.priority]} text-[11px] text-white px-2 flex items-center overflow-hidden whitespace-nowrap`}
                  style={{ left: startOffset * DAY_WIDTH + 4, width: span * DAY_WIDTH - 8 }}
                  title={`${task.title} (${task.startDate ?? 'No Start'} -> ${task.dueDate})`}
                >
                  {task.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
