import {
  Gamepad2,
  Gift,
  Layers,
  Medal,
  RefreshCw,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

export function FormSection({
  title,
  description,
  children,
  flush = false,
  grouped = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  flush?: boolean;
  grouped?: boolean;
}) {
  const content = (
    <>
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {flush ? <div className="p-4">{children}</div> : <div className="space-y-3 p-4">{children}</div>}
    </>
  );

  if (grouped) {
    return <div className="min-w-0">{content}</div>;
  }

  return <div className="card min-w-0 overflow-hidden">{content}</div>;
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </label>
  );
}

export const TOURNAMENT_FORMAT_OPTIONS = [
  {
    value: 'single_elimination',
    label: 'Single Elimination',
    description: 'Win to advance. One loss ends your run.',
    icon: Trophy,
  },
  {
    value: 'double_elimination',
    label: 'Double Elimination',
    description: 'Losers bracket gives everyone a second chance.',
    icon: Layers,
  },
  {
    value: 'swiss',
    label: 'Swiss Format',
    description: 'Players are re-paired each round by record.',
    icon: Users,
  },
  {
    value: 'round_robin',
    label: 'Round Robin',
    description: 'Every player faces everyone in the pool.',
    icon: RefreshCw,
  },
] as const;

export const TOURNAMENT_RANKING_OPTIONS = [
  {
    value: 'true',
    label: 'Ranked',
    description: 'Match wins award UGNCBBX rank points.',
    icon: Medal,
  },
  {
    value: 'false',
    label: 'Unranked',
    description: 'Casual or local event — no rank point changes.',
    icon: Users,
  },
] as const;

export function SelectionCard({
  selected,
  icon: Icon,
  label,
  description,
  disabled = false,
}: {
  selected: boolean;
  icon: LucideIcon;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
          selected
            ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
            : 'border-slate-700 bg-slate-900 text-slate-400'
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
    </>
  );
}

export function selectionCardClass(selected: boolean, disabled = false) {
  return `flex gap-3 rounded-xl border p-3.5 transition ${
    disabled ? 'cursor-default' : 'cursor-pointer'
  } ${
    selected
      ? 'border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30'
      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
  }`;
}
