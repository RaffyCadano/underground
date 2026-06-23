'use client';

import { PricingPlans } from '@/app/components/pricing-plans';

export function PricingPlansSection() {
  return (
    <section className="border-t border-slate-800 bg-slate-950/40">
      <div className="container py-12 sm:py-16 lg:py-20">
        <PricingPlans />
      </div>
    </section>
  );
}
