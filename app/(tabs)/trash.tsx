// app/(tabs)/trash.tsx
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LAYOUT } from '@/lib/constants/theme';

export default function Trash() {
  const { trashPhotos, loading, recoverFromTrash, deletePhoto, emptyTrash } = usePhotos();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
        <View className="bg-rose-500/10 p-8 rounded-[40px] mb-6">
          <Ionicons name="trash-outline" size={80} color="#f43f5e" />
        </View>
        <Text className="text-gray-400 text-xl font-semibold">Cargando papelera...</Text>
      </SafeAreaView>
    );
  }

  if (trashPhotos.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <View className="bg-rose-500/10 p-8 rounded-[40px] mb-8">
          <Ionicons name="trash-outline" size={120} color="#f43f5e" />
        </View>
        <Text className="text-white text-4xl font-black mb-4 tracking-tight">Papelera vacía</Text>
        <Text className="text-gray-400 text-center text-lg leading-7">
          Las fotos descartadas aparecerán aquí durante{' '}
          <Text className="text-amber-400 font-bold">{LAYOUT.TRASH_DAYS} días</Text> antes de eliminarse.
        </Text>
      </SafeAreaView>
    );
  }

  const handleRecover = (photoId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recoverFromTrash(photoId);
  };

  const handleDelete = (photoId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Eliminar permanentemente',
      '⚠️ Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deletePhoto(photoId);
          },
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Vaciar papelera',
      `¿Eliminar ${trashPhotos.length} foto${trashPhotos.length !== 1 ? 's' : ''} permanentemente?\n\n⚠️ Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar todo',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            emptyTrash();
          },
        },
      ]
    );
  };

  const getDaysLeft = (deletedAt?: number) => {
    if (!deletedAt) return LAYOUT.TRASH_DAYS;
    const daysPassed = Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
    return Math.max(0, LAYOUT.TRASH_DAYS - daysPassed);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-6 pb-5 border-b border-gray-800/50">
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-white text-4xl font-black tracking-tight">
              Papelera
            </Text>
            <Text className="text-rose-400 text-lg mt-1 font-bold">
              {trashPhotos.length} {trashPhotos.length === 1 ? 'foto' : 'fotos'}
            </Text>
          </View>
          <View className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-[24px] shadow-2xl shadow-rose-500/40">
            <Ionicons name="trash" size={32} color="white" />
          </View>
        </View>

        {/* Botón vaciar papelera */}
        <TouchableOpacity
          onPress={handleEmptyTrash}
          className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-5 rounded-[24px] flex-row items-center justify-center shadow-2xl shadow-rose-500/40"
          activeOpacity={0.8}
        >
          <Ionicons name="trash-bin" size={22} color="white" />
          <Text className="text-white text-lg font-black ml-3 tracking-wide">
            Vaciar papelera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid de fotos */}
      <FlatList
        data={trashPhotos}
        keyExtractor={(item) => item.id}
        numColumns={LAYOUT.TRASH_COLUMNS}
        contentContainerStyle={{ padding: LAYOUT.TRASH_GAP, paddingBottom: 32 }}
        columnWrapperStyle={{ gap: LAYOUT.TRASH_GAP, marginBottom: LAYOUT.TRASH_GAP }}
        renderItem={({ item, index }) => {
          const daysLeft = getDaysLeft(item.deletedAt);
          const isUrgent = daysLeft <= 2;
          const isCritical = daysLeft <= 1;
          
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 30).springify()}
              className="flex-1"
            >
              <View className="aspect-square rounded-[24px] overflow-hidden bg-gray-900 border-2 border-gray-800 relative shadow-lg">
                <Image
                  source={{ uri: item.uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                
                {/* Overlay oscuro */}
                <View className="absolute inset-0 bg-black/40" />

                {/* Badge de días con colores dinámicos */}
                <View 
                  className={`absolute top-3 right-3 px-4 py-2.5 rounded-[16px] shadow-xl ${
                    isCritical 
                      ? 'bg-rose-500' 
                      : isUrgent 
                      ? 'bg-amber-500' 
                      : 'bg-gray-800/95'
                  }`}
                >
                  <View className="flex-row items-center gap-1">
                    {(isUrgent || isCritical) && (
                      <Ionicons name="warning" size={14} color="white" />
                    )}
                    <Text className="text-white text-sm font-black">
                      {daysLeft}d
                    </Text>
                  </View>
                </View>

                {/* Botones de acción mejorados */}
                <View className="absolute bottom-3 left-3 right-3 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleRecover(item.id)}
                    className="bg-emerald-600 py-4 rounded-[18px] flex-1 items-center shadow-xl shadow-emerald-900/50"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-undo" size={22} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="bg-rose-600 py-4 rounded-[18px] flex-1 items-center shadow-xl shadow-rose-900/50"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Indicador de urgencia debajo */}
              {isUrgent && (
                <View className="mt-2 px-3">
                  <Text className={`text-xs font-bold text-center ${
                    isCritical ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {isCritical ? '⚠️ Elimina hoy' : '⚠️ Elimina pronto'}
                  </Text>
                </View>
              )}
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}