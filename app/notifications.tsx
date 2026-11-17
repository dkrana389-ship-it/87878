import React, { useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Empty, Screen, SectionTitle } from '../src/components/ui';
import { useProducts } from '../src/store/products';
import { useSettings } from '../src/store/settings';
import { buildReminders, sendTestNotification } from '../src/lib/notifications';
import { displayDate, fmt } from '../src/lib/dates';

export default function Notifications() {
  const router = useRouter();
  const { colors, settings } = useSettings();
  const { products } = useProducts();
  const [busy, setBusy] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const all = buildReminders(products, settings);
    const now = Date.now();
    return {
      upcoming: all.filter((r) => r.date.getTime() > now).slice(0, 40),
      past: all.filter((r) => r.date.getTime() <= now).reverse().slice(0, 40),
    };
  }, [products, settings]);

  const test = async () => {
    setBusy(true);
    const ok = await sendTestNotification();
    setBusy(false);
    Alert.alert(ok ? 'Sent' : 'Permission needed', ok ? 'You will get a test notification in 3 seconds.' : 'Allow notifications for this app in phone settings.');
  };

  const Item = ({ r, done }: { r: ReturnType<typeof buildReminders>[number]; done?: boolean }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${r.productId}` as any)}
      style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border, opacity: done ? 0.7 : 1 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: (r.offset <= 3 ? colors.danger : colors.accent) + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={done ? 'checkmark-done' : 'notifications'} size={20} color={r.offset <= 3 ? colors.danger : colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>{r.title}</Text>
        <Text style={{ color: colors.sub, fontSize: 12 }} numberOfLines={1}>{r.productName}</Text>
        <Text style={{ color: colors.sub, fontSize: 11, marginTop: 2 }}>{displayDate(fmt(r.date))} • {String(settings.reminderHour).padStart(2, '0')}:00</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <Button title="Send test notification" icon="paper-plane" variant="soft" onPress={test} loading={busy} style={{ marginBottom: 6 }} />
      {!settings.notificationsEnabled ? <Text style={{ color: colors.warn, marginVertical: 8 }}>Notifications are turned off in Settings.</Text> : null}
      <SectionTitle>Upcoming</SectionTitle>
      {upcoming.length === 0 ? <Empty icon="notifications-off-outline" title="No scheduled reminders" /> : upcoming.map((r) => <Item key={r.key} r={r} />)}
      {past.length > 0 && (<><SectionTitle>Earlier</SectionTitle>{past.map((r) => <Item key={r.key} r={r} done />)}</>)}
    </Screen>
  );
}
