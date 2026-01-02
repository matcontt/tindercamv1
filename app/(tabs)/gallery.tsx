// app/(tabs)/gallery.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function Gallery() {
  const { galleryPhotos, loading } = usePhotos();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
        <Text className="text-gray-200 text-xl font-semibold">Cargando galería...</Text>
      </SafeAreaView>
    );
  }

  if (galleryPhotos.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <Text className="text-white text-4xl font-bold mb-6">Galería vacía</Text>
        <Text className="text-gray-400 text-center text-lg leading-7">
          Captura momentos en la cámara y desliza hacia la derecha para guardarlos aquí
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="px-6 pt-6 pb-4 border-b border-gray-800">
        <Text className="text-white text-3xl font-bold tracking-tight">
          Galería
        </Text>
        <Text className="text-gray-400 text-lg mt-1">
          {galleryPhotos.length} foto{galleryPhotos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={galleryPhotos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 8, paddingBottom: 32 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 aspect-square px-2"
            onPress={() => router.push(`/photo/${item.id}`)}
          >
            <Image
              source={{ uri: item.uri }}
              className="w-full h-full rounded-2xl border border-gray-800 shadow-md shadow-black/30"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}