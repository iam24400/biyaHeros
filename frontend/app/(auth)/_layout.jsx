import { Stack } from 'expo-router';
import { useAuthStore } from '../../context/authStore';

export default function AuthLayout() {
  const { token } = useAuthStore();

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' }
    }}>
      <Stack.Screen 
        name="login" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  );
} 