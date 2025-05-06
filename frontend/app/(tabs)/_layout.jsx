import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import NotificationIcon from '../../components/NotificationIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'blue',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'history') {
            iconName = 'time';
          } else if (route.name === 'profile') {
            iconName = 'person';
          } else if (route.name === 'route') {
            iconName = 'map';
          } else if (route.name === 'navigation') {
            iconName = 'navigate';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <NotificationIcon />
          </View>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="route" options={{ title: "Route" }} />
      <Tabs.Screen name="navigation" options={{ title: "Navigation" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
} 