/** Format an integer SEK amount the Swedish way, e.g. "1 500 kr". */
export function formatSek(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Relative-ish short date, e.g. "18 jul". */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}
