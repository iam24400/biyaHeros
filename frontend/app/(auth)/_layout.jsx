import { Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

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