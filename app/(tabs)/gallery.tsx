// app/(tabs)/gallery.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';  // ← ESTE IMPORT FALTABA
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function Gallery() {
  const { galleryPhotos, loading } = usePhotos();
  const router = useRouter();  // Ahora sí está definido

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl font-medium">Cargando fotos...</Text>
      </View>
    );
  }

  if (galleryPhotos.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 px-6">
        <Text className="text-white text-3xl font-bold mb-4">Galería vacía</Text>
        <Text className="text-gray-400 text-center text-lg">
          Toma fotos en la cámara y desliza hacia la derecha para guardarlas aquí
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <FlatList
        data={galleryPhotos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 4 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 aspect-square p-1"
            onPress={() => router.push(`/photo/${item.id}`)}
          >
            <Image
              source={{ uri: item.uri }}
              className="w-full h-full rounded-xl border border-gray-700"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <View className="p-4">
            <Text className="text-white text-2xl font-bold">
              Galería ({galleryPhotos.length} foto{galleryPhotos.length !== 1 ? 's' : ''})
            </Text>
          </View>
        )}
      />
    </View>
  );
}