import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="camera"  // abre directo en cámara
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      {/* Ruta oculta: index existe pero NO aparece en la barra */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: () => null,  // ← Esto lo hace INVISIBLE en la tab bar
          tabBarStyle: { display: 'none' },  // opcional: oculta completamente el ítem
        }}
      />

      {/* Tus tabs visibles */}
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Cámara',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Galería',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Papelera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}