'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not open billing portal.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Could not open billing portal.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Manage billing
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
