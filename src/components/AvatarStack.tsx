import { users } from '../utils/dataGenerator';

interface Props {
  assigneeId?: string;
  collaborativeInitials?: string[];
}

export function AvatarStack({ assigneeId, collaborativeInitials = [] }: Props) {
  const base = users.find((u) => u.id === assigneeId);
  const initials = [base?.initials, ...collaborativeInitials].filter(Boolean) as string[];
  const shown = initials.slice(0, 3);

  return (
    <div className="flex items-center">
      {shown.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="h-7 w-7 -ml-1 first:ml-0 rounded-full border border-slate-800 bg-slate-700 text-[11px] font-semibold flex items-center justify-center text-slate-200"
        >
          {value}
        </div>
      ))}
      {initials.length > 3 && (
        <div className="ml-1 text-xs text-slate-400">+{initials.length - 3}</div>
      )}
    </div>
  );
}
