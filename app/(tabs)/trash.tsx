// app/(tabs)/trash.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, FlatList, TouchableOpacity, Alert} from 'react-native';
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
        <Text className="text-gray-400 text-center text-lg leading-7">
          Las fotos descartadas aparecen aquí por 7 días. Luego se eliminan automáticamente.
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
      '¿Seguro? Esta acción no se puede deshacer.',
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
      <View className="flex-row justify-between items-center px-6 pt-4 pb-3 border-b border-gray-800">
        <Text className="text-white text-3xl font-bold">Papelera</Text>
        <Text className="text-gray-400 text-base">({trashPhotos.length})</Text>
      </View>

      {trashPhotos.length > 0 && (
        <TouchableOpacity
          onPress={handleEmptyTrash}
          className="mx-6 my-4 bg-rose-700 px-6 py-3 rounded-xl items-center shadow-md shadow-rose-900/30"
        >
          <Text className="text-white text-base font-semibold">Vaciar papelera</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={trashPhotos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 32 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
        renderItem={({ item }) => {
          const daysLeft = getDaysLeft(item.deletedAt);
          return (
            <View className="flex-1 aspect-square px-2 relative">
              <Image
                source={{ uri: item.uri }}
                className="w-full h-full rounded-2xl border border-gray-800 shadow-sm shadow-black/30"
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2 bg-gray-800/80 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">{daysLeft}d</Text>
              </View>
              <View className="absolute bottom-2 right-2 flex-row space-x-2">
                <TouchableOpacity onPress={() => handleRecover(item.id)} className="bg-emerald-600 p-2 rounded-full shadow-sm shadow-emerald-900/30">
                  <Text className="text-white text-base">♻️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-rose-700 p-2 rounded-full shadow-sm shadow-rose-900/30">
                  <Text className="text-white text-base">🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}