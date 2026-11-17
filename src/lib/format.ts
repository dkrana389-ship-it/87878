export function inr(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  const out = s.length > 3 ? s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3) : s;
  return `${n < 0 ? '-' : ''}₹${out}`;
}

export const newId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const extOf = (uri: string, fallback: string) => {
  const m = uri.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  return (m ? m[1] : fallback).toLowerCase();
};

export const mimeOf = (ext: string) =>
  ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' } as Record<string, string>)[ext] ||
  'application/octet-stream';
