"use client";

// Small, dashed-outlined indicator for PURELY DECORATIVE elements.
// Place inside a `relative` parent; renders in the top-right corner.
// Use ONLY for elements with no plan to ever be implemented.
export function DecorBadge({ label = "Decorative" }: { label?: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-1.5 -right-1.5 z-10 rounded-full border-2 border-dashed border-mahogany/40 bg-surface/90 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-muted/70 shadow-sm"
    >
      {label}
    </span>
  );
}