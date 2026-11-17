import React from 'react';
import { Alert, Image, Linking, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, InfoRow, Row, Screen, SectionTitle, statusMeta } from '../../src/components/ui';
import { ProductImage } from '../../src/components/ProductImage';
import { useProducts } from '../../src/store/products';
import { useSettings } from '../../src/store/settings';
import { daysText, daysUntil, displayDate, statusOf } from '../../src/lib/dates';
import { inr } from '../../src/lib/format';
import * as Sharing from 'expo-sharing';
import { Countdown } from '../../src/components/Countdown';

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, settings } = useSettings();
  const { getProduct, deleteProduct } = useProducts();
  const p = getProduct(id);
  const isImgBill = !!p?.bill_name && /\.(jpe?g|png)$/i.test(p.bill_name);

  if (!p) return <Screen><Text style={{ color: colors.text }}>Product not found.</Text></Screen>;

  const st = statusOf(p.warranty_expiry, settings.soonDays);
  const meta = statusMeta(st, colors);

  const openBill = async () => {
    if (!p.bill_uri) return;
    if (!(await Sharing.isAvailableAsync())) return Alert.alert('Not supported', 'Cannot open files on this device.');
    const isPdf = /\.pdf$/i.test(p.bill_name || p.bill_uri);
    Sharing.shareAsync(p.bill_uri, { mimeType: isPdf ? 'application/pdf' : 'image/*', dialogTitle: 'Open or save bill' }).catch(() =>
      Alert.alert('Error', 'Could not open the bill.')
    );
  };

  const remove = () =>
    Alert.alert('Delete product?', `"${p.name}" and its bill will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProduct(p.id); router.back(); } },
    ]);

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <ProductImage product={p} size={150} radius={28} />
        <Text style={{ color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 12, textAlign: 'center' }}>{p.name}</Text>
        <Text style={{ color: colors.sub }}>{[p.brand, p.category].filter(Boolean).join(' • ')}</Text>
      </View>

      <Card style={{ borderColor: meta.color }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Badge status={st} />
          <Text style={{ color: meta.color, fontWeight: '800' }}>{daysText(p.warranty_expiry)}</Text>
        </Row>
        <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Warranty timer</Text>
        <Countdown expiry={p.warranty_expiry} />
        {p.guarantee_months > 0 && p.guarantee_expiry ? (
          <>
            <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginTop: 14, marginBottom: 6 }}>Guarantee timer ({displayDate(p.guarantee_expiry)})</Text>
            <Countdown expiry={p.guarantee_expiry} />
          </>
        ) : null}
      </Card>

      <Card>
        <InfoRow label="Model number" value={p.model_number} />
        <InfoRow label="Serial number" value={p.serial_number} />
        <InfoRow label="Purchase date" value={displayDate(p.purchase_date)} />
        <InfoRow label="Warranty start" value={displayDate(p.warranty_start)} />
        <InfoRow label="Warranty period" value={p.warranty_months ? `${p.warranty_months} months` : undefined} />
        <InfoRow label="Warranty expiry" value={displayDate(p.warranty_expiry)} />
        <InfoRow label="Guarantee period" value={p.guarantee_months ? `${p.guarantee_months} months` : undefined} />
        <InfoRow label="Guarantee expiry" value={p.guarantee_months ? displayDate(p.guarantee_expiry) : undefined} />
        <InfoRow label="Purchase amount" value={p.amount ? inr(p.amount) : undefined} />
      </Card>

      {(p.store_name || p.store_address || p.store_phone) && (
        <>
          <SectionTitle>Shop</SectionTitle>
          <Card>
            <InfoRow label="Store" value={p.store_name} />
            <InfoRow label="Address" value={p.store_address} />
            <InfoRow label="Contact" value={p.store_phone} />
            {p.store_phone ? (
              <Button title="Call shop" icon="call" variant="soft" style={{ marginTop: 12 }} onPress={() => Linking.openURL(`tel:${p.store_phone}`)} />
            ) : null}
          </Card>
        </>
      )}

      <SectionTitle>Purchase bill</SectionTitle>
      <Card>
        {p.bill_name ? (
          <>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 10 }} numberOfLines={1}>{p.bill_name}</Text>
            {isImgBill && p.bill_uri ? <Image source={{ uri: p.bill_uri }} style={{ width: '100%', height: 220, borderRadius: 12, marginBottom: 10 }} resizeMode="contain" /> : null}
            <Button title="Open / Download bill" icon="download" onPress={openBill} />
          </>
        ) : (
          <Text style={{ color: colors.sub }}>No bill uploaded. Tap Edit to attach one.</Text>
        )}
      </Card>

      {p.notes ? (<><SectionTitle>Notes</SectionTitle><Card><Text style={{ color: colors.text }} selectable>{p.notes}</Text></Card></>) : null}

      <Row style={{ marginTop: 6 }}>
        <Button title="Edit" icon="create" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/edit/${p.id}` as any)} />
        <Button title="Delete" icon="trash" variant="danger" style={{ flex: 1 }} onPress={remove} />
      </Row>
    </Screen>
  );
}
