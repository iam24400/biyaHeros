import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import NotificationIcon from '../../components/NotificationIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 55,
          paddingBottom: 2,
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <NotificationIcon />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color === '#007AFF' ? '#34C759' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'Route',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color === '#007AFF' ? '#FF9500' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          title: 'Navigation',
          tabBarIcon: ({ color, size }) => (
            <Ionicons 
              name="navigate" 
              size={size} 
              color={color === '#007AFF' ? '#007AFF' : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color === '#007AFF' ? '#FFD700' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color === '#007AFF' ? '#FF3B30' : color} />
          ),
        }}
      />
    </Tabs>
  );
} 