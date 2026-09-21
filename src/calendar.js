export const toDate = value => new Date(`${value}T12:00:00Z`);
export const toISO = date => date.toISOString().slice(0, 10);
export const monthStart = value => `${value.slice(0, 7)}-01`;
export function shiftDay(value, amount) {
  const date = toDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return toISO(date);
}
export function shiftMonth(value, amount) {
  const date = toDate(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return toISO(date);
}
export function monthCells(value) {
  const first = monthStart(value);
  const offset = toDate(first).getUTCDay();
  return Array.from({ length: 42 }, (_, i) => {
    const date = shiftDay(first, i - offset);
    return date.slice(0, 7) === first.slice(0, 7) ? date : null;
  });
}
export const monthLabel = value => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(toDate(value));
export const fullDateLabel = value => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(toDate(value));
export const shortDateLabel = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(toDate(value));
