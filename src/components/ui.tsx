import React, { useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TextInputProps,
  TouchableOpacity, View, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../store/settings';
import { displayDate, fmt, parse, Status } from '../lib/dates';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Screen({
  children, scroll = true, refreshing, onRefresh, style,
}: {
  children: React.ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void; style?: ViewStyle;
}) {
  const { colors } = useSettings();
  const ins = useSafeAreaInsets();
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 24 + ins.bottom }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useSettings();
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }, style]}>
      {children}
    </View>
  );
}

export function Button({
  title, onPress, variant = 'primary', icon, loading, disabled, style,
}: {
  title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'danger' | 'soft'; icon?: IconName;
  loading?: boolean; disabled?: boolean; style?: ViewStyle;
}) {
  const { colors } = useSettings();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'soft' ? colors.soft : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? colors.onPrimary : variant === 'soft' ? colors.accent : colors.accent;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        { height: 50, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18, opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0, borderColor: colors.accent },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <>
          {icon ? <Ionicons name={icon} size={19} color={fg} /> : null}
          <Text style={{ color: fg, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const { colors } = useSettings();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.sub + '99'}
        {...props}
        style={[
          { backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15 },
          props.multiline ? { minHeight: 90, textAlignVertical: 'top' } : null,
          props.style,
        ]}
      />
    </View>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { colors } = useSettings();
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={{ color: colors.sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{ backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text style={{ color: value ? colors.text : colors.sub, fontSize: 15 }}>{value ? displayDate(value) : 'Select date'}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.accent} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? parse(value) : new Date()}
          mode="date"
          onChange={(e, d) => {
            setShow(false);
            if (e.type === 'set' && d) onChange(fmt(d));
          }}
        />
      )}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress: () => void; icon?: IconName }) {
  const { colors } = useSettings();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: active ? colors.primary : colors.card, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? colors.onPrimary : colors.sub} /> : null}
      <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function statusMeta(s: Status, colors: ReturnType<typeof useSettings>['colors']) {
  return s === 'active'
    ? { label: 'Active', color: colors.success }
    : s === 'soon'
    ? { label: 'Expiring soon', color: colors.warn }
    : { label: 'Expired', color: colors.danger };
}

export function Badge({ status }: { status: Status }) {
  const { colors } = useSettings();
  const m = statusMeta(status, colors);
  return (
    <View style={{ backgroundColor: m.color + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
      <Text style={{ color: m.color, fontSize: 11, fontWeight: '700' }}>{m.label}</Text>
    </View>
  );
}

export function SectionTitle({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  const { colors } = useSettings();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 10 }}>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{children}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Empty({ icon, title, sub }: { icon: IconName; title: string; sub?: string }) {
  const { colors } = useSettings();
  return (
    <View style={{ alignItems: 'center', padding: 36 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Ionicons name={icon} size={36} color={colors.accent} />
      </View>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{title}</Text>
      {sub ? <Text style={{ color: colors.sub, textAlign: 'center', marginTop: 6 }}>{sub}</Text> : null}
    </View>
  );
}

export function StatCard({ icon, label, value, color }: { icon: IconName; label: string; value: string; color: string }) {
  const { colors } = useSettings();
  return (
    <View style={{ width: '48.5%', backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={{ color: colors.sub, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const { colors } = useSettings();
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
      <Text style={{ color: colors.sub, width: '40%', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.text, flex: 1, fontSize: 14, fontWeight: '600' }} selectable>{value}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', gap: 10 }, style]}>{children}</View>;
}
