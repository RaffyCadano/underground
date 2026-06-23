export function AdcashAdLabel({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        'mb-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500'
      }
      aria-hidden="true"
    >
      Advertisement
    </p>
  );
}
