// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const handleTabPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tabs
      initialRouteName="camera"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#030712',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      {/* Ruta oculta: index */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: () => null,
        }}
      />

      {/* Cámara */}
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Cámara',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'camera' : 'camera-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
      />

      {/* Galería */}
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Galería',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'images' : 'images-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
      />

      {/* Papelera */}
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Papelera',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'trash' : 'trash-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}