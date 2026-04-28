import { useEffect, useState } from 'react';

export type PresenceAvatar = {
  id: string;
  initials: string;
  color: string; // tailwind class like "bg-indigo-500"
  kind: 'in' | 'out';
};

function PresenceAvatarBubble({ avatar }: { avatar: PresenceAvatar }) {
  const [visible, setVisible] = useState(avatar.kind === 'out');

  useEffect(() => {
    // Animate onto/off a card when the presence moves.
    const raf = window.requestAnimationFrame(() => {
      setVisible(avatar.kind === 'in');
    });
    return () => window.cancelAnimationFrame(raf);
  }, [avatar.kind]);

  return (
    <div
      className={[
        'h-7 w-7 rounded-full border border-slate-900 text-[11px] font-semibold flex items-center justify-center',
        avatar.color,
        'transition-all duration-300 ease-out will-change-transform',
        visible ? 'opacity-100 translate-y-0' : avatar.kind === 'in' ? 'opacity-0 translate-y-1' : 'opacity-0 -translate-y-1'
      ].join(' ')}
      title={avatar.id}
    >
      {avatar.initials}
    </div>
  );
}

export function PresenceAvatarStack({ avatars, max = 3 }: { avatars: PresenceAvatar[]; max?: number }) {
  const shown = avatars.slice(0, max);
  const overflow = Math.max(0, avatars.length - shown.length);

  return (
    <div className="flex items-center">
      {shown.map((avatar) => (
        <div key={`${avatar.id}-${avatar.kind}`} className={shown.length > 0 ? '-ml-1 first:ml-0' : ''}>
          <PresenceAvatarBubble avatar={avatar} />
        </div>
      ))}
      {overflow > 0 && <div className="ml-1 text-xs text-slate-300">+{overflow}</div>}
    </div>
  );
}

