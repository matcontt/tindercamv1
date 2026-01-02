// app/(tabs)/gallery.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function Gallery() {
  const { galleryPhotos, loading } = usePhotos();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl">Cargando fotos...</Text>
      </View>
    );
  }

  if (galleryPhotos.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-2xl">No hay fotos guardadas aún</Text>
        <Text className="text-gray-400 mt-2">Toma fotos y desliza para guardar</Text>
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
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-1 aspect-square p-1">
            <Image
              source={{ uri: item.uri }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <Text className="text-white text-xl font-semibold p-4">
            Galería ({galleryPhotos.length} fotos)
          </Text>
        )}
      />
    </View>
  );
}