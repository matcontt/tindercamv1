// app/photo/[id].tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { galleryPhotos, trashPhotos, deletePhoto, recoverFromTrash } = usePhotos();

  const allPhotos = [...galleryPhotos, ...trashPhotos];
  const photo = allPhotos.find(p => p.id === id);

  if (!photo) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <Text className="text-white text-3xl font-bold mb-6">Foto no encontrada</Text>
        <Text className="text-gray-400 text-center text-lg mb-8">
          La foto seleccionada no está en galería ni papelera.
        </Text>
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
  const formattedDate = new Date(photo.timestamp).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(photo.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const daysLeft = isInTrash ? Math.max(0, 7 - Math.floor((Date.now() - (photo.deletedAt || Date.now())) / (1000 * 60 * 60 * 24))) : null;

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
        {/* Imagen grande */}
        <View className="items-center px-4 pt-4">
          <Image
            source={{ uri: photo.uri }}
            className="w-full h-[70vh] rounded-3xl border border-gray-800 shadow-2xl shadow-black/50"
            resizeMode="contain"
          />
        </View>

        {/* Info y acciones */}
        <View className="px-6 pb-10 mt-6">
          <Text className="text-white text-3xl font-bold mb-4">Detalles</Text>

          <View className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
            <Text className="text-gray-300 text-base mb-3">
              <Text className="font-semibold text-white">Fecha:</Text> {formattedDate}
            </Text>
            <Text className="text-gray-300 text-base mb-3">
              <Text className="font-semibold text-white">Hora:</Text> {formattedTime}
            </Text>
            <Text className="text-gray-300 text-base">
              <Text className="font-semibold text-white">Estado:</Text> {isInTrash ? 'En papelera' : 'Guardada en galería'}
            </Text>
            {isInTrash && (
              <Text className="text-amber-400 text-base mt-3 font-medium">
                Quedan {daysLeft} día{daysLeft !== 1 ? 's' : ''} para recuperar
              </Text>
            )}
          </View>

          <View className="space-y-4">
            {isInTrash ? (
              <>
                <TouchableOpacity
                  onPress={handleRecover}
                  className="bg-emerald-700 py-5 rounded-2xl items-center shadow-lg shadow-emerald-900/30"
                >
                  <Text className="text-white text-lg font-semibold">Recuperar a galería</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-rose-700 py-5 rounded-2xl items-center shadow-lg shadow-rose-900/30"
                >
                  <Text className="text-white text-lg font-semibold">Eliminar permanentemente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-rose-700 py-5 rounded-2xl items-center shadow-lg shadow-rose-900/30"
              >
                <Text className="text-white text-lg font-semibold">Eliminar de galería</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-gray-800 py-4 rounded-2xl items-center"
          >
            <Text className="text-gray-200 text-base font-medium">Cerrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}