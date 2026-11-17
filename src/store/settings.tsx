import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Settings = {
  mode: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  reminderDays: number[];
  reminderHour: number;
  soonDays: number;
};

const DEFAULTS: Settings = {
  mode: 'system',
  notificationsEnabled: true,
  reminderDays: [30, 15, 7, 3, 0],
  reminderHour: 9,
  soonDays: 30,
};

export const lightColors = {
  bg: '#F3F6FC', card: '#FFFFFF', text: '#0B1F4B', sub: '#5B6785', border: '#E1E7F3',
  primary: '#0B1F4B', onPrimary: '#FFFFFF', accent: '#2F5BD3', soft: '#E8EEFC',
  success: '#12A150', warn: '#E8890C', danger: '#D93025', input: '#FFFFFF', header: '#0B1F4B',
};
export const darkColors: typeof lightColors = {
  bg: '#071126', card: '#0F1E3D', text: '#EAF0FF', sub: '#9AA9CC', border: '#1C2D52',
  primary: '#4F7BFF', onPrimary: '#FFFFFF', accent: '#6C91FF', soft: '#16284D',
  success: '#2ECC71', warn: '#F5A524', danger: '#FF6B5E', input: '#0B1830', header: '#0F1E3D',
};

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  colors: typeof lightColors;
  isDark: boolean;
};
const SettingsCtx = createContext<Ctx>(null as unknown as Ctx);
const KEY = 'wr:settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSettings({ ...DEFAULTS, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((cur) => {
      const next = { ...cur, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isDark = settings.mode === 'system' ? system === 'dark' : settings.mode === 'dark';
  const value = useMemo(
    () => ({ settings, update, isDark, colors: isDark ? darkColors : lightColors }),
    [settings, update, isDark]
  );
  if (!ready) return null;
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export const useSettings = () => useContext(SettingsCtx);
