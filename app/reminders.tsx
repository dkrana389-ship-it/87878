import React from 'react';
import { Text, View } from 'react-native';
import { Card, Chip, Empty, Screen, SectionTitle } from '../src/components/ui';
import { ProductCard } from '../src/components/ProductCard';
import { useProducts } from '../src/store/products';
import { useSettings } from '../src/store/settings';
import { REMINDER_CHOICES } from '../src/constants';
import { daysUntil } from '../src/lib/dates';

export default function Reminders() {
  const { colors, settings, update } = useSettings();
  const { products } = useProducts();

  const toggle = (d: number) => {
    const has = settings.reminderDays.includes(d);
    const next = has ? settings.reminderDays.filter((x) => x !== d) : [...settings.reminderDays, d];
    update({ reminderDays: next.sort((a, b) => b - a) });
  };

  const upcoming = products
    .map((p) => {
      const w = daysUntil(p.warranty_expiry);
      const g = p.guarantee_months > 0 && p.guarantee_expiry ? daysUntil(p.guarantee_expiry) : -1;
      const nextDays = Math.min(...[w, g].filter((d) => d >= 0).concat(9999));
      return { p, nextDays };
    })
    .filter((x) => x.nextDays !== 9999)
    .sort((a, b) => a.nextDays - b.nextDays);

  return (
    <Screen>
      <Card>
        <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 4 }}>Remind me before expiry</Text>
        <Text style={{ color: colors.sub, fontSize: 12, marginBottom: 10 }}>Select the days. Applies to warranty and guarantee. "0 days" = on expiry day.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {REMINDER_CHOICES.map((d) => (
            <Chip key={d} label={d === 0 ? 'Expiry day' : `${d} days`} active={settings.reminderDays.includes(d)} onPress={() => toggle(d)} />
          ))}
        </View>
        {settings.reminderDays.length === 0 ? <Text style={{ color: colors.warn, fontSize: 12 }}>No days selected — you won't get reminders.</Text> : null}
      </Card>

      <SectionTitle>Upcoming expiries</SectionTitle>
      {upcoming.length === 0 ? (
        <Empty icon="alarm-outline" title="No upcoming expiries" sub="Add a product to start getting reminders." />
      ) : (
        upcoming.map(({ p }) => <ProductCard key={p.id} p={p} />)
      )}
    </Screen>
  );
}
