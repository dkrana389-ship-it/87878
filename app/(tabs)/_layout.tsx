import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/settings';

type N = React.ComponentProps<typeof Ionicons>['name'];
const icon = (on: N, off: N) => ({ color, focused, size }: { color: string; focused: boolean; size: number }) =>
  <Ionicons name={focused ? on : off} size={size} color={color} />;

export default function TabsLayout() {
  const { colors } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="products" options={{ title: 'My Products', tabBarLabel: 'Products', tabBarIcon: icon('cube', 'cube-outline') }} />
      <Tabs.Screen name="add" options={{ title: 'Add Product', tabBarLabel: 'Add', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: icon('stats-chart', 'stats-chart-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings', 'settings-outline') }} />
    </Tabs>
  );
}
