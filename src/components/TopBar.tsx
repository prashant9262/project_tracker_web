import { CollaborationPresence } from '../types';

interface Props {
  presence: CollaborationPresence[];
}

export function TopBar({ presence }: Props) {
  const active = presence.filter((p) => p.active);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-100">Frontend Project Tracker</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-300">
          {active.length} people are viewing this board
        </span>
        <div className="flex">
          {active.map((person, index) => (
            <div
              key={person.id}
              className={`h-7 w-7 -ml-1 first:ml-0 rounded-full border border-slate-900 ${person.color} text-[11px] text-white font-semibold flex items-center justify-center transition-transform`}
              style={{ transform: `translateY(${index % 2 === 0 ? 0 : 1}px)` }}
              title={person.name}
            >
              {person.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
