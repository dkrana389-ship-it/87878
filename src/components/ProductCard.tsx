import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '../types';
import { useSettings } from '../store/settings';
import { daysText, displayDate, statusOf } from '../lib/dates';
import { ProductImage } from './ProductImage';
import { Badge, statusMeta } from './ui';

export function ProductCard({ p }: { p: Product }) {
  const { colors, settings } = useSettings();
  const router = useRouter();
  const st = statusOf(p.warranty_expiry, settings.soonDays);
  const meta = statusMeta(st, colors);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${p.id}` as any)}
      style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border, gap: 12 }}
    >
      <ProductImage product={p} size={74} radius={16} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15, flex: 1 }} numberOfLines={1}>{p.name}</Text>
        </View>
        <Text style={{ color: colors.sub, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
          {[p.brand, p.category].filter(Boolean).join(' • ')}
        </Text>
        <Text style={{ color: colors.sub, fontSize: 12, marginTop: 4 }}>Purchased: {displayDate(p.purchase_date)}</Text>
        <Text style={{ color: colors.sub, fontSize: 12 }}>Warranty till: {displayDate(p.warranty_expiry)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Badge status={st} />
          <Text style={{ color: meta.color, fontSize: 11, fontWeight: '600' }}>{daysText(p.warranty_expiry)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
