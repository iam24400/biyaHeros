import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../context/authStore';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { token, isCheckingAuth, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log('Layout effect - Auth state:', { isCheckingAuth, hasToken: !!token });
    
    if (isCheckingAuth) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('Current segment:', segments[0]);

    if (!token && !inAuthGroup) {
      console.log('Redirecting to login...');
      router.replace('/login');
    } else if (token && inAuthGroup) {
      console.log('Redirecting to tabs...');
      router.replace('/(tabs)');
    }
  }, [token, isCheckingAuth, segments]);

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
