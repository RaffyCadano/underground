import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

export function ProfileSettingsComingSoon({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="border-b border-slate-800 px-6 py-8 text-center sm:px-10">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-brand-400">
          <Icon size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-400">
          Coming soon
        </p>
      </div>
    </div>
  );
}
