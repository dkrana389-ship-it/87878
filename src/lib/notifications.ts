import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Product } from '../types';
import { parse, displayDate } from './dates';
import type { Settings } from '../store/settings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'warranty';

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Warranty reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0B1F4B',
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export type Reminder = {
  key: string; // unique & deterministic -> no duplicates
  productId: string;
  productName: string;
  kind: 'warranty' | 'guarantee';
  offset: number;
  date: Date;
  expiry: string;
  title: string;
  body: string;
};

/** Pure function: every reminder that should exist for the given products + settings. */
export function buildReminders(products: Product[], s: Pick<Settings, 'reminderDays' | 'reminderHour'>): Reminder[] {
  const out: Reminder[] = [];
  const offsets = Array.from(new Set(s.reminderDays)).sort((a, b) => b - a);
  for (const p of products) {
    const items: { kind: 'warranty' | 'guarantee'; expiry: string | null }[] = [
      { kind: 'warranty', expiry: p.warranty_expiry },
      { kind: 'guarantee', expiry: p.guarantee_months > 0 ? p.guarantee_expiry : null },
    ];
    for (const it of items) {
      if (!it.expiry) continue;
      for (const off of offsets) {
        const d = parse(it.expiry);
        d.setDate(d.getDate() - off);
        d.setHours(s.reminderHour, 0, 0, 0);
        const label = it.kind === 'warranty' ? 'Warranty' : 'Guarantee';
        out.push({
          key: `${p.id}:${it.kind}:${off}`,
          productId: p.id,
          productName: p.name,
          kind: it.kind,
          offset: off,
          date: d,
          expiry: it.expiry,
          title: off === 0 ? `${label} expires today!` : `${label} expiring in ${off} day${off === 1 ? '' : 's'}`,
          body:
            off === 0
              ? `${p.name} ${label.toLowerCase()} ends today (${displayDate(it.expiry)}). Claim anything pending now.`
              : `${p.name} ${label.toLowerCase()} ends on ${displayDate(it.expiry)}.`,
        });
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Cancel everything and schedule again — identical result every time, so never duplicates. */
export async function rescheduleAll(products: Product[], s: Settings) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!s.notificationsEnabled) return;
    const ok = await ensurePermission();
    if (!ok) return;
    const now = Date.now();
    const future = buildReminders(products, s)
      .filter((r) => r.date.getTime() > now)
      .slice(0, 400); // Android keeps a limited number of alarms per app
    for (const r of future) {
      await Notifications.scheduleNotificationAsync({
        identifier: r.key,
        content: { title: r.title, body: r.body, data: { productId: r.productId }, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL },
      });
    }
  } catch (e) {
    console.warn('reschedule failed', e);
  }
}

export async function sendTestNotification() {
  const ok = await ensurePermission();
  if (!ok) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Warranty Reminder', body: 'Test notification working ✅' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: CHANNEL },
  });
  return true;
}
