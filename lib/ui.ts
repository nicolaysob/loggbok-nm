// Delte klasse-strenger. Ingen React — trygt å importere fra både
// server- og klientkomponenter.

export const cardClass =
  "rounded-2xl border border-line bg-white/95 shadow-card " +
  "transition-[transform,box-shadow,background-color] duration-150 " +
  "active:scale-[0.99] active:bg-navy-50";

export const cardStaticClass =
  "rounded-2xl border border-line bg-white/95 shadow-card";

export const solidActionClass =
  "bg-brand text-white shadow-lift transition-colors " +
  "active:bg-brand-dark disabled:opacity-60";

export const outlineActionClass =
  "border border-line bg-white/95 text-navy-900 shadow-soft " +
  "transition-colors active:bg-navy-50 disabled:opacity-60";

export const textareaClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 " +
  "text-body text-navy-900 shadow-soft outline-none " +
  "focus:border-navy-700 focus:ring-4 focus:ring-navy-900/15";

export const labelClass = "text-heading text-navy-900";

export const backLinkClass =
  "inline-flex min-h-12 items-center text-body font-medium text-navy-700 " +
  "transition-colors active:text-navy-900";

export const adminBackLinkClass =
  "text-meta font-medium text-navy-700 transition-colors hover:text-navy-900";

export const noticeClass =
  "rounded-2xl border border-line bg-navy-50/80 px-4 py-3 text-body text-navy-900";

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2 " +
  "text-body text-navy-900 shadow-soft outline-none " +
  "focus:border-navy-700 focus:ring-4 focus:ring-navy-900/15";
