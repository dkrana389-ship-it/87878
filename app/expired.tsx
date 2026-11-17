import React from 'react';
import { Screen, Empty } from '../src/components/ui';
import { ProductCard } from '../src/components/ProductCard';
import { useProducts } from '../src/store/products';
import { useSettings } from '../src/store/settings';
import { statusOf } from '../src/lib/dates';

export default function Expired() {
  const { settings } = useSettings();
  const { products } = useProducts();
  const list = products
    .filter((p) => statusOf(p.warranty_expiry, settings.soonDays) === 'expired')
    .sort((a, b) => b.warranty_expiry.localeCompare(a.warranty_expiry));
  return (
    <Screen>
      {list.length === 0 ? (
        <Empty icon="checkmark-done-circle-outline" title="Nothing expired" sub="Great! None of your warranties have expired." />
      ) : (
        list.map((p) => <ProductCard key={p.id} p={p} />)
      )}
    </Screen>
  );
}
