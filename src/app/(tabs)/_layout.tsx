import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 1. This is the "official" way to set the screen background in Tabs
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.card,
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: palette.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'The Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="us"
        options={{
          title: 'Us',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
