import { AtSign, Mail, Shield } from 'lucide-react';
import { roleBadgeClass, roleLabel } from '@/lib/roles';

type Props = {
  username: string;
  email: string;
  role: string;
};

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
  children,
}: {
  icon: typeof AtSign;
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-500">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {children ?? (
          <p
            className={`mt-1 break-all text-sm font-semibold text-white ${mono ? 'font-mono text-[13px]' : ''}`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export function ProfileAccountSection({ username, email, role }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div className="border-b border-slate-800 bg-slate-900/50 px-5 py-4">
        <h3 className="text-sm font-semibold text-white">Account</h3>
        <p className="mt-0.5 text-xs text-slate-500">Sign-in details for UGNCBBX</p>
      </div>

      <div className="divide-y divide-slate-800/80">
        <DetailRow icon={AtSign} label="Username" value={username} />
        <DetailRow icon={Mail} label="Email" value={email} mono />
        <DetailRow icon={Shield} label="Role">
          <span
            className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBadgeClass(role)}`}
          >
            {roleLabel(role)}
          </span>
        </DetailRow>
      </div>
    </section>
  );
}
