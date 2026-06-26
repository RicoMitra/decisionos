export function formatPercent(value: number, digits = 1) {
  return `${safeNumber(value).toFixed(digits)}%`;
}

export function formatScore(value: number, digits = 1) {
  return safeNumber(value).toFixed(digits);
}

export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function daysBetween(start: string, end: string) {
  const startMs = Date.parse(`${start}T00:00:00.000Z`);
  const endMs = Date.parse(`${end}T00:00:00.000Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;

  return Math.round((endMs - startMs) / 86_400_000);
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}
