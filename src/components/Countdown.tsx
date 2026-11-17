import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSettings } from '../store/settings';
import { parse } from '../lib/dates';

/** Live ticking timer to the end of the expiry day. */
export function Countdown({ expiry, onDark }: { expiry: string; onDark?: boolean }) {
  const { colors } = useSettings();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = parse(expiry);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now;
  const fg = onDark ? '#FFFFFF' : colors.text;
  const box = onDark ? '#FFFFFF22' : colors.soft;

  if (diff <= 0) {
    return <Text style={{ color: onDark ? '#FFB4AB' : colors.danger, fontWeight: '800', fontSize: 15 }}>⏰ Expired</Text>;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cells: [number, string][] = [[d, 'DAYS'], [h, 'HRS'], [m, 'MIN'], [s, 'SEC']];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {cells.map(([v, l]) => (
        <View key={l} style={{ flex: 1, backgroundColor: box, borderRadius: 12, paddingVertical: 8, alignItems: 'center' }}>
          <Text style={{ color: fg, fontSize: 22, fontWeight: '800' }}>{String(v).padStart(2, '0')}</Text>
          <Text style={{ color: onDark ? '#B9C6EA' : colors.sub, fontSize: 10, fontWeight: '700' }}>{l}</Text>
        </View>
      ))}
    </View>
  );
}
