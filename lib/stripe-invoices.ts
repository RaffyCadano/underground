import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

export type BillingInvoice = {
  id: string;
  number: string | null;
  date: Date;
  amountCents: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
};

function mapInvoice(invoice: Stripe.Invoice): BillingInvoice {
  const amountCents = invoice.amount_paid > 0 ? invoice.amount_paid : invoice.total;

  return {
    id: invoice.id,
    number: invoice.number,
    date: new Date(invoice.created * 1000),
    amountCents,
    currency: invoice.currency,
    status: invoice.status ?? 'unknown',
    pdfUrl: invoice.invoice_pdf ?? null,
    hostedUrl: invoice.hosted_invoice_url ?? null,
  };
}

export async function listCustomerInvoices(
  stripeCustomerId: string,
): Promise<BillingInvoice[]> {
  const stripe = getStripe();
  const { data } = await stripe.invoices.list({
    customer: stripeCustomerId,
    limit: 24,
  });

  return data.map(mapInvoice);
}

export function formatInvoiceAmount(amountCents: number, currency: string): string {
  return (amountCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
}

export function formatInvoiceStatus(status: string): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'open':
      return 'Open';
    case 'void':
      return 'Void';
    case 'uncollectible':
      return 'Uncollectible';
    case 'draft':
      return 'Draft';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function invoiceStatusClass(status: string): string {
  switch (status) {
    case 'paid':
      return 'border-brand-500/30 bg-brand-500/10 text-brand-300';
    case 'open':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
    case 'void':
    case 'uncollectible':
      return 'border-red-500/30 bg-red-500/10 text-red-300';
    default:
      return 'border-slate-700 bg-slate-900 text-slate-400';
  }
}
