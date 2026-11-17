const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n: number) => String(n).padStart(2, '0');

export const fmt = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayStr = () => fmt(new Date());

export function addMonths(s: string, months: number): string {
  const d = parse(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return fmt(d);
}

export function daysUntil(s: string): number {
  return Math.round((parse(s).getTime() - parse(todayStr()).getTime()) / 86400000);
}

export function displayDate(s?: string | null): string {
  if (!s) return '—';
  const d = parse(s);
  return `${p2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export type Status = 'active' | 'soon' | 'expired';
export function statusOf(expiry: string, soonDays: number): Status {
  const d = daysUntil(expiry);
  if (d < 0) return 'expired';
  if (d <= soonDays) return 'soon';
  return 'active';
}

export function daysText(expiry: string): string {
  const d = daysUntil(expiry);
  if (d === 0) return 'Expires today';
  if (d > 0) return `${d} day${d === 1 ? '' : 's'} left`;
  return `Expired ${-d} day${d === -1 ? '' : 's'} ago`;
}

export const monthLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
