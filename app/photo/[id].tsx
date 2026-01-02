// app/photo/[id].tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePhotos } from '@/lib/contexts/PhotoContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { galleryPhotos, trashPhotos, deletePhoto, recoverFromTrash } = usePhotos();

  const allPhotos = [...galleryPhotos, ...trashPhotos];
  const photo = allPhotos.find(p => p.id === id);

  if (!photo) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-2xl">Foto no encontrada</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isInTrash = trashPhotos.some(p => p.id === id);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar permanentemente',
      '¿Seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePhoto(photo.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleRecover = () => {
    recoverFromTrash(photo.id);
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      {/* Foto grande con zoom (puedes agregar pinch-to-zoom después) */}
      <Image
        source={{ uri: photo.uri }}
        className="w-full h-full"
        resizeMode="contain"
      />

      {/* Overlay con info y acciones */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-6">
        <Text className="text-white text-lg mb-2">
          Tomada el {new Date(photo.timestamp).toLocaleDateString()}
        </Text>

        <View className="flex-row justify-around mt-4">
          {isInTrash ? (
            <>
              <TouchableOpacity
                onPress={handleRecover}
                className="bg-green-600 px-6 py-3 rounded-lg flex-row items-center"
              >
                <Text className="text-white font-bold mr-2">♻️ Recuperar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-600 px-6 py-3 rounded-lg flex-row items-center"
              >
                <Text className="text-white font-bold mr-2">🗑️ Eliminar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-600 px-8 py-4 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-bold text-lg mr-2">Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-gray-700 px-6 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-medium">Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}