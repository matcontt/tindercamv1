// app/(tabs)/trash.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function Trash() {
  const { trashPhotos, loading, recoverFromTrash, deletePhoto, emptyTrash } = usePhotos();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
        <Text className="text-gray-200 text-xl font-semibold">Cargando papelera...</Text>
      </SafeAreaView>
    );
  }

  if (trashPhotos.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <Text className="text-white text-4xl font-bold mb-6">Papelera vacía</Text>
        <Text className="text-gray-400 text-center text-lg leading-6">
          Las fotos que descartes aparecerán aquí durante 7 días.{'\n'}
          Luego se eliminarán automáticamente.
        </Text>
      </SafeAreaView>
    );
  }

  const handleRecover = (photoId: string) => {
    recoverFromTrash(photoId);
  };

  const handleDelete = (photoId: string) => {
    Alert.alert(
      'Eliminar permanentemente',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePhoto(photoId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      'Vaciar papelera',
      '¿Eliminar todas las fotos permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar todo',
          style: 'destructive',
          onPress: emptyTrash,
        },
      ],
      { cancelable: true }
    );
  };

  const getDaysLeft = (deletedAt?: number) => {
    if (!deletedAt) return 7;
    const daysPassed = Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysPassed);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-800">
        <Text className="text-white text-3xl font-bold tracking-tight">
          Papelera
        </Text>
        <Text className="text-gray-400 text-base font-medium">
          {trashPhotos.length} foto{trashPhotos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Botón Vaciar (solo si hay fotos) */}
      {trashPhotos.length > 0 && (
        <TouchableOpacity
          onPress={handleEmptyTrash}
          className="mx-6 mt-4 mb-2 bg-rose-800/90 py-3.5 rounded-xl items-center shadow-lg shadow-rose-900/30"
        >
          <Text className="text-white text-base font-semibold">Vaciar papelera</Text>
        </TouchableOpacity>
      )}

      {/* Grid */}
      <FlatList
        data={trashPhotos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 6 }}
        renderItem={({ item }) => {
          const daysLeft = getDaysLeft(item.deletedAt);
          const isUrgent = daysLeft <= 2;

          return (
            <View className="flex-1 aspect-square px-1 relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
              <Image
                source={{ uri: item.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Badge días restantes */}
              <View
                className={`absolute top-2 right-2 px-2.5 py-1 rounded-full ${
                  isUrgent ? 'bg-amber-600' : 'bg-gray-800/90'
                }`}
              >
                <Text className="text-white text-xs font-medium">
                  {daysLeft}d
                </Text>
              </View>

              {/* Botones de acción */}
              <View className="absolute inset-x-0 bottom-0 flex-row justify-evenly bg-gradient-to-t from-black/80 to-transparent pt-12 pb-3 px-2">
                <TouchableOpacity
                  onPress={() => handleRecover(item.id)}
                  className="bg-emerald-700/90 p-3 rounded-full shadow-md shadow-emerald-900/40"
                >
                  <Text className="text-white text-xl">♻️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-rose-700/90 p-3 rounded-full shadow-md shadow-rose-900/40"
                >
                  <Text className="text-white text-xl">🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}