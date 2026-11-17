import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import '../src/lib/notifications';
import { SettingsProvider, useSettings } from '../src/store/settings';
import { ProductsProvider } from '../src/store/products';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { colors } = useSettings();
  const router = useRouter();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      const id = r.notification.request.content.data?.productId as string | undefined;
      if (id) router.push(`/product/${id}` as any);
    });
    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Edit Product' }} />
        <Stack.Screen name="reminders" options={{ title: 'Warranty Reminders' }} />
        <Stack.Screen name="expired" options={{ title: 'Expired Products' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      </Stack>
    </>
  );
}

export default function Root() {
  return (
    <SettingsProvider>
      <ProductsProvider>
        <Shell />
      </ProductsProvider>
    </SettingsProvider>
  );
}
