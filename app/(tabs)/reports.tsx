import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Card, Screen, SectionTitle } from '../../src/components/ui';
import { useProducts } from '../../src/store/products';
import { useSettings } from '../../src/store/settings';
import { daysUntil, monthLabel, parse, statusOf } from '../../src/lib/dates';
import { inr } from '../../src/lib/format';

function Bar({ label, value, max, text, color }: { label: string; value: number; max: number; text: string; color: string }) {
  const { colors } = useSettings();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: colors.text, fontSize: 13, flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600' }}>{text}</Text>
      </View>
      <View style={{ height: 9, borderRadius: 6, backgroundColor: colors.soft }}>
        <View style={{ height: 9, borderRadius: 6, backgroundColor: color, width: `${max ? Math.max(3, (value / max) * 100) : 0}%` }} />
      </View>
    </View>
  );
}

export default function Reports() {
  const { colors, settings } = useSettings();
  const { products } = useProducts();

  const data = useMemo(() => {
    const total = products.reduce((s, p) => s + (p.amount || 0), 0);
    const byCat: Record<string, number> = {};
    products.forEach((p) => (byCat[p.category] = (byCat[p.category] || 0) + (p.amount || 0)));
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const status = { active: 0, soon: 0, expired: 0 };
    products.forEach((p) => status[statusOf(p.warranty_expiry, settings.soonDays)]++);
    const months: { label: string; count: number }[] = [];
    const base = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      months.push({ label: monthLabel(d), count: products.filter((p) => { const e = parse(p.warranty_expiry); return e.getFullYear() === d.getFullYear() && e.getMonth() === d.getMonth() && daysUntil(p.warranty_expiry) >= 0; }).length });
    }
    return { total, cats, status, months, avg: products.length ? total / products.length : 0 };
  }, [products, settings.soonDays]);

  const maxCat = Math.max(0, ...data.cats.map((c) => c[1]));
  const maxMonth = Math.max(0, ...data.months.map((m) => m.count));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1 }}><Text style={{ color: colors.sub, fontSize: 12 }}>Total spent</Text><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{inr(data.total)}</Text></Card>
        <Card style={{ flex: 1 }}><Text style={{ color: colors.sub, fontSize: 12 }}>Average / product</Text><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{inr(data.avg)}</Text></Card>
      </View>

      <SectionTitle>Warranty status</SectionTitle>
      <Card>
        <Bar label="Active" value={data.status.active} max={products.length} text={String(data.status.active)} color={colors.success} />
        <Bar label="Expiring soon" value={data.status.soon} max={products.length} text={String(data.status.soon)} color={colors.warn} />
        <Bar label="Expired" value={data.status.expired} max={products.length} text={String(data.status.expired)} color={colors.danger} />
      </Card>

      <SectionTitle>Expiring in next 6 months</SectionTitle>
      <Card>{data.months.map((m) => <Bar key={m.label} label={m.label} value={m.count} max={maxMonth} text={String(m.count)} color={colors.accent} />)}</Card>

      <SectionTitle>Spending by category</SectionTitle>
      <Card>
        {data.cats.length === 0 ? <Text style={{ color: colors.sub }}>No data yet.</Text> : data.cats.map(([c, v]) => <Bar key={c} label={c} value={v} max={maxCat} text={inr(v)} color="#0EA5A4" />)}
      </Card>
    </Screen>
  );
}
