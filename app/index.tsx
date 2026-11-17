import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

export default function Splash() {
  const router = useRouter();
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setMinDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (minDone) router.replace('/(tabs)/dashboard');
  }, [minDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1F4B', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 110, height: 110, borderRadius: 34, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="shield-checkmark" size={64} color="#fff" />
      </View>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 22 }}>Warranty Reminder</Text>
      <Text style={{ color: '#B9C6EA', marginTop: 6, fontSize: 15 }}>Never Miss Your Warranty!</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
    </View>
  );
}
