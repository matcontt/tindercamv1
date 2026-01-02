// app/(tabs)/trash.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { usePhotos } from '@/lib/contexts/PhotoContext';

export default function Trash() {
  const { trashPhotos, loading, recoverFromTrash, deletePhoto, emptyTrash } = usePhotos();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl font-medium">Cargando papelera...</Text>
      </View>
    );
  }

  if (trashPhotos.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 px-6">
        <Text className="text-white text-3xl font-bold mb-4">Papelera vacía</Text>
        <Text className="text-gray-400 text-center text-lg">
          Las fotos descartadas aparecerán aquí por 7 días
        </Text>
      </View>
    );
  }

  const handleRecover = (photoId: string) => {
    recoverFromTrash(photoId);
  };

  const handleDelete = (photoId: string) => {
    Alert.alert(
      'Eliminar permanentemente',
      '¿Seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePhoto(photoId),
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      'Vaciar papelera',
      '¿Eliminar todas las fotos de la papelera permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: emptyTrash,
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-white text-2xl font-bold">
          Papelera ({trashPhotos.length} foto{trashPhotos.length !== 1 ? 's' : ''})
        </Text>
        <TouchableOpacity
          onPress={handleEmptyTrash}
          className="bg-red-600/80 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Vaciar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trashPhotos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 4 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View className="flex-1 aspect-square p-1 relative">
            <Image
              source={{ uri: item.uri }}
              className="w-full h-full rounded-xl border border-gray-700"
              resizeMode="cover"
            />
            <View className="absolute bottom-2 right-2 flex-row space-x-2">
              <TouchableOpacity
                onPress={() => handleRecover(item.id)}
                className="bg-green-600/90 p-2 rounded-full"
              >
                <Text className="text-white text-xs">♻️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="bg-red-600/90 p-2 rounded-full"
              >
                <Text className="text-white text-xs">🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}