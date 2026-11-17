import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { addMonths, todayStr } from '../lib/dates';
import { newId } from '../lib/format';
import { persistFile } from '../lib/files';
import { useSettings } from '../store/settings';
import { Button, Chip, DateField, Field, Row, SectionTitle } from './ui';
import { ProductImage } from './ProductImage';

type Props = { initial?: Product; submitLabel: string; onSubmit: (p: Product) => Promise<void> };

export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const { colors } = useSettings();
  const today = todayStr();

  const [f, setF] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? CATEGORIES[0],
    brand: initial?.brand ?? '',
    model_number: initial?.model_number ?? '',
    serial_number: initial?.serial_number ?? '',
    purchase_date: initial?.purchase_date ?? today,
    warranty_start: initial?.warranty_start ?? today,
    warranty_months: String(initial?.warranty_months ?? 12),
    warranty_expiry: initial?.warranty_expiry ?? addMonths(today, 12),
    guarantee_months: String(initial?.guarantee_months ?? 0),
    guarantee_expiry: initial?.guarantee_expiry ?? '',
    store_name: initial?.store_name ?? '',
    store_address: initial?.store_address ?? '',
    store_phone: initial?.store_phone ?? '',
    amount: initial ? String(initial.amount || '') : '',
    notes: initial?.notes ?? '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [bill, setBill] = useState<{ uri: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((c) => ({ ...c, [k]: v }));
  const months = (s: string) => Math.max(0, parseInt(s, 10) || 0);

  const onPurchase = (v: string) =>
    setF((c) => {
      const follow = c.warranty_start === c.purchase_date;
      const start = follow ? v : c.warranty_start;
      const gm = months(c.guarantee_months);
      return {
        ...c,
        purchase_date: v,
        warranty_start: start,
        warranty_expiry: follow && months(c.warranty_months) > 0 ? addMonths(start, months(c.warranty_months)) : c.warranty_expiry,
        guarantee_expiry: gm > 0 ? addMonths(v, gm) : '',
      };
    });
  const onWStart = (v: string) =>
    setF((c) => ({ ...c, warranty_start: v, warranty_expiry: months(c.warranty_months) > 0 ? addMonths(v, months(c.warranty_months)) : c.warranty_expiry }));
  const onWMonths = (t: string) =>
    setF((c) => ({ ...c, warranty_months: t.replace(/\D/g, ''), warranty_expiry: months(t) > 0 ? addMonths(c.warranty_start, months(t)) : c.warranty_expiry }));
  const onGMonths = (t: string) =>
    setF((c) => ({ ...c, guarantee_months: t.replace(/\D/g, ''), guarantee_expiry: months(t) > 0 ? addMonths(c.purchase_date, months(t)) : '' }));

  const pickPhoto = () =>
    Alert.alert('Product photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permission needed', 'Allow camera access in phone settings.');
          const r = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
          if (!r.canceled) setPhoto(r.assets[0].uri);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true });
          if (!r.canceled) setPhoto(r.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const pickBill = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png'], copyToCacheDirectory: true });
    if (r.canceled) return;
    const a = r.assets[0];
    if ((a.size ?? 0) > 10 * 1024 * 1024) return Alert.alert('File too big', 'Bill must be under 10 MB.');
    setBill({ uri: a.uri, name: a.name });
  };

  const submit = async () => {
    if (!f.name.trim()) return Alert.alert('Missing', 'Product name is required.');
    if (!f.purchase_date) return Alert.alert('Missing', 'Purchase date is required.');
    if (!f.warranty_expiry) return Alert.alert('Missing', 'Warranty expiry date is required.');
    if (f.warranty_expiry < f.warranty_start) return Alert.alert('Check dates', 'Warranty expiry cannot be before warranty start.');
    if (f.store_phone && f.store_phone.replace(/\D/g, '').length < 7) return Alert.alert('Check phone', 'Enter a valid shop contact number.');
    const gm = months(f.guarantee_months);
    const id = initial?.id ?? newId();
    const now = new Date().toISOString();
    setSaving(true);
    try {
      const photo_uri = photo ? await persistFile(photo, id, 'photo') : initial?.photo_uri ?? null;
      const bill_uri = bill ? await persistFile(bill.uri, id, 'bill', bill.name) : initial?.bill_uri ?? null;
      const p: Product = {
        id,
        name: f.name.trim(),
        category: f.category,
        brand: f.brand.trim(),
        model_number: f.model_number.trim(),
        serial_number: f.serial_number.trim(),
        purchase_date: f.purchase_date,
        warranty_start: f.warranty_start,
        warranty_months: months(f.warranty_months),
        warranty_expiry: f.warranty_expiry,
        guarantee_months: gm,
        guarantee_expiry: gm > 0 ? f.guarantee_expiry || addMonths(f.purchase_date, gm) : null,
        store_name: f.store_name.trim(),
        store_address: f.store_address.trim(),
        store_phone: f.store_phone.trim(),
        amount: Number(f.amount.replace(/,/g, '')) || 0,
        notes: f.notes.trim(),
        photo_uri,
        bill_uri,
        bill_name: bill ? bill.name : initial?.bill_name ?? null,
        created_at: initial?.created_at ?? now,
        updated_at: now,
      };
      await onSubmit(p);
    } catch (e) {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85} style={{ alignSelf: 'center', marginBottom: 18 }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: 120, height: 120, borderRadius: 24 }} />
        ) : initial ? (
          <ProductImage product={initial} size={120} radius={24} />
        ) : (
          <View style={{ width: 120, height: 120, borderRadius: 24, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.accent }}>
            <Ionicons name="camera-outline" size={34} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 4 }}>Add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <SectionTitle>Product</SectionTitle>
      <Field label="Product Name *" value={f.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Samsung Galaxy S24" />
      <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        {CATEGORIES.map((c) => <Chip key={c} label={c} active={f.category === c} onPress={() => set('category', c)} />)}
      </View>
      <Field label="Brand Name" value={f.brand} onChangeText={(v) => set('brand', v)} />
      <Row>
        <View style={{ flex: 1 }}><Field label="Model Number" value={f.model_number} onChangeText={(v) => set('model_number', v)} autoCapitalize="characters" /></View>
        <View style={{ flex: 1 }}><Field label="Serial Number" value={f.serial_number} onChangeText={(v) => set('serial_number', v)} autoCapitalize="characters" /></View>
      </Row>

      <SectionTitle>Warranty & Guarantee</SectionTitle>
      <Row>
        <DateField label="Purchase Date *" value={f.purchase_date} onChange={onPurchase} />
        <DateField label="Warranty Start *" value={f.warranty_start} onChange={onWStart} />
      </Row>
      <Row>
        <View style={{ flex: 1 }}><Field label="Warranty (months)" value={f.warranty_months} onChangeText={onWMonths} keyboardType="number-pad" /></View>
        <DateField label="Warranty Expiry * (auto)" value={f.warranty_expiry} onChange={(v) => set('warranty_expiry', v)} />
      </Row>
      <Row>
        <View style={{ flex: 1 }}><Field label="Guarantee Period (months)" value={f.guarantee_months} onChangeText={onGMonths} keyboardType="number-pad" /></View>
        {months(f.guarantee_months) > 0 ? (
          <DateField label="Guarantee Expiry (auto)" value={f.guarantee_expiry} onChange={(v) => set('guarantee_expiry', v)} />
        ) : <View style={{ flex: 1 }} />}
      </Row>

      <SectionTitle>Shop details</SectionTitle>
      <Field label="Shop / Store Name" value={f.store_name} onChangeText={(v) => set('store_name', v)} />
      <Field label="Shop Address" value={f.store_address} onChangeText={(v) => set('store_address', v)} multiline />
      <Field label="Shop Contact Number" value={f.store_phone} onChangeText={(v) => set('store_phone', v)} keyboardType="phone-pad" />
      <Field label="Purchase Amount (₹)" value={f.amount} onChangeText={(v) => set('amount', v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="0" />

      <SectionTitle>Purchase bill</SectionTitle>
      <TouchableOpacity onPress={pickBill} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.accent, backgroundColor: colors.soft, marginBottom: 12 }}>
        <Ionicons name="document-attach-outline" size={26} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>{bill ? bill.name : initial?.bill_name ?? 'Upload bill (PDF, JPG, PNG)'}</Text>
          <Text style={{ color: colors.sub, fontSize: 12 }}>{bill || initial?.bill_name ? 'Tap to replace' : 'Max 10 MB'}</Text>
        </View>
      </TouchableOpacity>

      <Field label="Additional Notes" value={f.notes} onChangeText={(v) => set('notes', v)} multiline placeholder="Extended warranty, service centre, etc." />
      <Button title={submitLabel} icon="checkmark-circle" onPress={submit} loading={saving} />
    </View>
  );
}
