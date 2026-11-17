import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Empty, Screen, SectionTitle, StatCard } from '../../src/components/ui';
import { ProductCard } from '../../src/components/ProductCard';
import { useProducts } from '../../src/store/products';
import { useSettings } from '../../src/store/settings';
import { Countdown } from '../../src/components/Countdown';
import { displayDate } from '../../src/lib/dates';
import { daysUntil, statusOf } from '../../src/lib/dates';
import { inr } from '../../src/lib/format';

export default function Dashboard() {
  const router = useRouter();
  const { colors, settings } = useSettings();
  const { products } = useProducts();

  const st = (p: (typeof products)[number]) => statusOf(p.warranty_expiry, settings.soonDays);
  const soon = products.filter((p) => st(p) === 'soon').sort((a, b) => a.warranty_expiry.localeCompare(b.warranty_expiry));
  const expired = products.filter((p) => st(p) === 'expired');
  const active = products.filter((p) => st(p) !== 'expired');
  const guarantees = products.filter((p) => p.guarantee_months > 0 && p.guarantee_expiry && daysUntil(p.guarantee_expiry) >= 0);
  const total = products.reduce((s, p) => s + (p.amount || 0), 0);
  const next = products
    .flatMap((p) => {
      const items = [{ p, kind: 'Warranty', expiry: p.warranty_expiry }];
      if (p.guarantee_months > 0 && p.guarantee_expiry) items.push({ p, kind: 'Guarantee', expiry: p.guarantee_expiry });
      return items;
    })
    .filter((x) => daysUntil(x.expiry) >= 0)
    .sort((a, b) => a.expiry.localeCompare(b.expiry))[0];
  const recent = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);

  return (
    <Screen>
      <View style={{ backgroundColor: colors.primary, borderRadius: 22, padding: 18, marginBottom: 16 }}>
        <Text style={{ color: '#B9C6EA', fontSize: 13 }}>Next expiry</Text>
        {next ? (
          <>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>{next.p.name}</Text>
            <Text style={{ color: '#DCE5FF', fontSize: 12, marginBottom: 12 }}>{next.kind} ends on {displayDate(next.expiry)}</Text>
            <Countdown expiry={next.expiry} onDark />
          </>
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 6 }}>No upcoming expiry. Add a product to start the timer.</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <StatCard icon="cube" label="Total Products" value={String(products.length)} color={colors.accent} />
        <StatCard icon="shield-checkmark" label="Active Warranties" value={String(active.length)} color={colors.success} />
        <StatCard icon="alarm" label="Expiring Soon" value={String(soon.length)} color={colors.warn} />
        <StatCard icon="close-circle" label="Expired Warranties" value={String(expired.length)} color={colors.danger} />
        <StatCard icon="ribbon" label="Active Guarantees" value={String(guarantees.length)} color="#8E5CF7" />
        <StatCard icon="wallet" label="Total Purchase Amount" value={inr(total)} color="#0EA5A4" />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
        {[
          { l: 'Add', i: 'add-circle' as const, go: '/(tabs)/add' },
          { l: 'Reminders', i: 'alarm' as const, go: '/reminders' },
          { l: 'Expired', i: 'archive' as const, go: '/expired' },
          { l: 'Alerts', i: 'notifications' as const, go: '/notifications' },
        ].map((a) => (
          <TouchableOpacity key={a.l} onPress={() => router.push(a.go as any)} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name={a.i} size={22} color={colors.accent} />
            <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 4 }}>{a.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {soon.length > 0 && (
        <>
          <SectionTitle action="See all" onAction={() => router.push('/reminders' as any)}>Expiring soon</SectionTitle>
          {soon.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} />)}
        </>
      )}

      <SectionTitle action="View all" onAction={() => router.push('/(tabs)/products' as any)}>Recently added</SectionTitle>
      {recent.length === 0 ? (
        <Card><Empty icon="cube-outline" title="No products yet" sub="Tap Add to save your first product and never miss its warranty." /></Card>
      ) : (
        recent.map((p) => <ProductCard key={p.id} p={p} />)
      )}
    </Screen>
  );
}
