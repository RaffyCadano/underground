import { FileStack } from 'lucide-react';
import { ProfileSettingsComingSoon } from '@/app/components/profile-settings-coming-soon';

export default function TournamentTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Tournament Templates</h1>
        <span className="rounded border border-orange-500/45 bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
          Labs
        </span>
      </div>
      <p className="text-sm text-slate-400">
        Save bracket formats, rules, and prize structures to reuse across events.
      </p>
      <ProfileSettingsComingSoon
        icon={FileStack}
        title="Template library coming soon"
        description="Build once and spin up new tournaments faster — we're testing this in Labs first."
      />
    </div>
  );
}
