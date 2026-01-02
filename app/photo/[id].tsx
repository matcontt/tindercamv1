// app/photo/[id].tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePhotos } from '@/lib/contexts/PhotoContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { galleryPhotos, trashPhotos, deletePhoto, recoverFromTrash, moveToTrash } = usePhotos(); // Agrega moveToTrash

  const allPhotos = [...galleryPhotos, ...trashPhotos];
  const photo = allPhotos.find(p => p.id === id);

  if (!photo) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
        <Text className="text-white text-3xl font-bold mb-6">Foto no encontrada</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-emerald-600 px-10 py-5 rounded-2xl shadow-lg shadow-emerald-900/30"
        >
          <Text className="text-white text-lg font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isInTrash = trashPhotos.some(p => p.id === id);

  const handleDelete = () => {
    Alert.alert(
      isInTrash ? 'Eliminar permanentemente' : 'Mover a papelera',
      isInTrash ? '¿Seguro? Esta acción no se puede deshacer.' : 'La foto se moverá a papelera por 7 días.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isInTrash ? 'Eliminar' : 'Mover',
          style: 'destructive',
          onPress: () => {
            if (isInTrash) {
              deletePhoto(photo.id);
            } else {
              moveToTrash(photo.uri, photo.width, photo.height); // Usa moveToTrash para galería
            }
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRecover = () => {
    recoverFromTrash(photo.id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView className="flex-1">
        {/* Imagen */}
        <View className="items-center px-4 pt-4">
          <Image
            source={{ uri: photo.uri }}
            className="w-full h-[60vh] rounded-3xl border border-gray-800 shadow-2xl shadow-black/50"
            resizeMode="contain"
          />
        </View>

        {/* Info */}
        <View className="px-6 pb-10 mt-6">
          <Text className="text-white text-3xl font-bold mb-4">Detalles</Text>
          <Text className="text-gray-300 text-base mb-2">Fecha: {new Date(photo.timestamp).toLocaleString()}</Text>
          <Text className="text-gray-300 text-base">Estado: {isInTrash ? 'En papelera' : 'En galería'}</Text>
        </View>
      </ScrollView>

      {/* Acciones */}
      <View className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        {isInTrash ? (
          <>
            <TouchableOpacity onPress={handleRecover} className="bg-emerald-600 py-4 rounded-2xl mb-3">
              <Text className="text-white text-center font-semibold">Recuperar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="bg-rose-600 py-4 rounded-2xl">
              <Text className="text-white text-center font-semibold">Eliminar permanente</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleDelete} className="bg-rose-600 py-4 rounded-2xl">
            <Text className="text-white text-center font-semibold">Mover a papelera</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}