import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
          
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
        
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Usuários',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="equipments"
        options={{
          title: 'Equipamentos',
          tabBarIcon: ({ color }) => <Ionicons name="desktop" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nucleos"
        options={{
          title: 'Nucleos',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatorios',
          tabBarIcon: ({ color }) => <Ionicons name="document" size={30} color={color} />,
        }}
      />
      
      
    </Tabs>
  );
}



