import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, Screen, SectionTitle } from '../../src/components/ui';
import { useSettings } from '../../src/store/settings';
import { useProducts } from '../../src/store/products';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, settings, update } = useSettings();
  const { products, clearAll } = useProducts();
  return (
    <Screen>
      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip icon="phone-portrait-outline" label="System" active={settings.mode === 'system'} onPress={() => update({ mode: 'system' })} />
          <Chip icon="sunny-outline" label="Light" active={settings.mode === 'light'} onPress={() => update({ mode: 'light' })} />
          <Chip icon="moon-outline" label="Dark" active={settings.mode === 'dark'} onPress={() => update({ mode: 'dark' })} />
        </View>
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Enable notifications</Text>
          <Switch value={settings.notificationsEnabled} onValueChange={(v) => update({ notificationsEnabled: v })} trackColor={{ true: colors.accent }} />
        </View>
        <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Reminder time</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[7, 8, 9, 10, 12, 18, 20].map((h) => (
            <Chip key={h} label={`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`} active={settings.reminderHour === h} onPress={() => update({ reminderHour: h })} />
          ))}
        </View>
        <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginVertical: 6 }}>"Expiring soon" means within</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
          {[15, 30, 45, 60].map((d) => <Chip key={d} label={`${d} days`} active={settings.soonDays === d} onPress={() => update({ soonDays: d })} />)}
        </View>
        <Button title="Customize reminder days" icon="alarm" variant="soft" onPress={() => router.push('/reminders' as any)} style={{ marginBottom: 10 }} />
        <Button title="Notifications & test" icon="notifications" variant="soft" onPress={() => router.push('/notifications' as any)} style={{ marginBottom: 10 }} />
        <Button title="Expired products" icon="archive" variant="soft" onPress={() => router.push('/expired' as any)} />
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card>
        <Text style={{ color: colors.sub, marginBottom: 10 }}>All data is stored only on this phone. {products.length} product(s) saved.</Text>
        <Button
          title="Delete all products"
          icon="trash"
          variant="danger"
          onPress={() => Alert.alert('Delete everything?', 'All products, photos and bills will be removed from this phone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete all', style: 'destructive', onPress: clearAll },
          ])}
        />
      </Card>
      <Text style={{ color: colors.sub, textAlign: 'center', marginTop: 8, fontSize: 12 }}>Warranty Reminder v1.0.0</Text>
    </Screen>
  );
}
