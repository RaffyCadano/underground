import Link from 'next/link';
import { ExternalLink, FileText } from 'lucide-react';
import { BILLING_HISTORY_EMPTY } from '@/lib/subscriptions';
import {
  formatInvoiceAmount,
  formatInvoiceStatus,
  invoiceStatusClass,
  type BillingInvoice,
} from '@/lib/stripe-invoices';

function formatInvoiceDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BillingHistoryList({
  invoices,
  hasStripeCustomer,
}: {
  invoices: BillingInvoice[];
  hasStripeCustomer: boolean;
}) {
  if (!hasStripeCustomer) {
    return <p className="text-sm leading-relaxed text-slate-400">{BILLING_HISTORY_EMPTY}</p>;
  }

  if (invoices.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-slate-400">
        No invoices yet. Your first receipt will appear here after your Premier payment clears.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden gap-4 border-b border-slate-800 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[1fr_auto_auto_auto]">
        <span>Date</span>
        <span className="text-right">Amount</span>
        <span>Status</span>
        <span className="text-right">Receipt</span>
      </div>

      <ul className="divide-y divide-slate-800/80">
        {invoices.map((invoice) => (
          <li
            key={invoice.id}
            className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
          >
            <div>
              <p className="text-sm font-medium text-white">{formatInvoiceDate(invoice.date)}</p>
              {invoice.number && (
                <p className="mt-0.5 text-xs text-slate-500">Invoice {invoice.number}</p>
              )}
            </div>

            <p className="text-sm font-medium tabular-nums text-slate-200 sm:text-right">
              {formatInvoiceAmount(invoice.amountCents, invoice.currency)}
            </p>

            <span
              className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${invoiceStatusClass(invoice.status)}`}
            >
              {formatInvoiceStatus(invoice.status)}
            </span>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {invoice.pdfUrl && (
                <Link
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  <FileText size={14} />
                  PDF
                </Link>
              )}
              {invoice.hostedUrl && (
                <Link
                  href={invoice.hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  <ExternalLink size={14} />
                  View
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
