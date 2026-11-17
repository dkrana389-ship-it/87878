import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Empty } from '../../src/components/ui';
import { ProductCard } from '../../src/components/ProductCard';
import { useProducts } from '../../src/store/products';
import { useSettings } from '../../src/store/settings';
import { Status, statusOf } from '../../src/lib/dates';

type Filter = 'all' | Status;
type Sort = 'soonest' | 'latest' | 'newest' | 'name';

export default function Products() {
  const { colors, settings } = useSettings();
  const { products } = useProducts();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('soonest');

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = products.filter((p) => {
      if (filter !== 'all' && statusOf(p.warranty_expiry, settings.soonDays) !== filter) return false;
      if (!s) return true;
      return [p.name, p.brand, p.model_number, p.serial_number, p.category, p.store_name].some((x) => (x || '').toLowerCase().includes(s));
    });
    r = [...r].sort((a, b) =>
      sort === 'soonest' ? a.warranty_expiry.localeCompare(b.warranty_expiry)
      : sort === 'latest' ? b.warranty_expiry.localeCompare(a.warranty_expiry)
      : sort === 'newest' ? b.created_at.localeCompare(a.created_at)
      : a.name.localeCompare(b.name));
    return r;
  }, [products, q, filter, sort, settings.soonDays]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginBottom: 10 }}>
          <Ionicons name="search" size={18} color={colors.sub} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search name, brand, model, serial…" placeholderTextColor={colors.sub + '99'} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.text }} />
          {q ? <Ionicons name="close-circle" size={18} color={colors.sub} onPress={() => setQ('')} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Active" active={filter === 'active'} onPress={() => setFilter('active')} />
          <Chip label="Expiring soon" active={filter === 'soon'} onPress={() => setFilter('soon')} />
          <Chip label="Expired" active={filter === 'expired'} onPress={() => setFilter('expired')} />
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip icon="swap-vertical" label="Expiry: soonest" active={sort === 'soonest'} onPress={() => setSort('soonest')} />
          <Chip label="Expiry: latest" active={sort === 'latest'} onPress={() => setSort('latest')} />
          <Chip label="Newest added" active={sort === 'newest'} onPress={() => setSort('newest')} />
          <Chip label="Name A–Z" active={sort === 'name'} onPress={() => setSort('name')} />
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ProductCard p={item} />}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={<Empty icon="search-outline" title="No products found" sub="Try another search or filter." />}
        ListHeaderComponent={<Text style={{ color: colors.sub, fontSize: 12, marginBottom: 8 }}>{list.length} product(s)</Text>}
      />
    </View>
  );
}
