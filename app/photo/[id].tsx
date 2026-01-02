import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { galleryPhotos, trashPhotos, deletePhoto, recoverFromTrash, moveToTrash } = usePhotos();

  const allPhotos = [...galleryPhotos, ...trashPhotos];
  const photo = allPhotos.find(p => p.id === id);

  // Zoom y pan mejorados
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedTranslationX = useSharedValue(0);
  const savedTranslationY = useSharedValue(0);const pinch = Gesture.Pinch()
  .onUpdate((event) => {
  scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 5));
  })
  .onEnd(() => {
  if (scale.value < 1.1) {
  scale.value = withSpring(1);
  savedScale.value = 1;
  translationX.value = withSpring(0);
  translationY.value = withSpring(0);
  savedTranslationX.value = 0;
  savedTranslationY.value = 0;
  } else {
  savedScale.value = scale.value;
  }
  });const pan = Gesture.Pan()
  .minPointers(1)
  .onUpdate((event) => {
  if (scale.value > 1) {
  translationX.value = savedTranslationX.value + event.translationX;
  translationY.value = savedTranslationY.value + event.translationY;
  }
  })
  .onEnd(() => {
  savedTranslationX.value = translationX.value;
  savedTranslationY.value = translationY.value;
  });const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (scale.value > 1) {
  scale.value = withSpring(1);
  savedScale.value = 1;
  translationX.value = withSpring(0);
  translationY.value = withSpring(0);
  savedTranslationX.value = 0;
  savedTranslationY.value = 0;
  } else {
  scale.value = withSpring(2.5);
  savedScale.value = 2.5;
  }
  });const gestures = Gesture.Simultaneous(pinch, pan, doubleTap);const animatedStyle = useAnimatedStyle(() => ({
  transform: [
  { translateX: translationX.value },
  { translateY: translationY.value },
  { scale: scale.value },
  ],
  }));if (!photo) {
  return (
  <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
  <Ionicons name="image-outline" size={120} color="#4b5563" />
  <Text className="text-white text-3xl font-bold mb-4 mt-6">Foto no encontrada</Text>
  <Text className="text-gray-400 text-center text-lg mb-8">
  La foto con ID {id} no está disponible.
  </Text>
  <TouchableOpacity
  onPress={() => router.back()}
  className="bg-emerald-600 px-10 py-5 rounded-2xl shadow-lg shadow-emerald-900/50"
  >
  <Text className="text-white text-lg font-semibold">Volver</Text>
  </TouchableOpacity>
  </SafeAreaView>
  );
  }const isInTrash = trashPhotos.some(p => p.id === id);
  const formattedDate = new Date(photo.timestamp).toLocaleString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  });
  const daysLeft = isInTrash
  ? Math.max(0, 7 - Math.floor((Date.now() - (photo.deletedAt || Date.now())) / (1000 * 60 * 60 * 24)))
  : null;const handleDelete = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Alert.alert(
  isInTrash ? 'Eliminar permanentemente' : 'Mover a papelera',
  isInTrash
  ? '⚠️ Esta acción no se puede deshacer.'
  : 'La foto se moverá a papelera por 7 días.',
  [
  { text: 'Cancelar', style: 'cancel' },
  {
  text: isInTrash ? 'Eliminar' : 'Mover',
  style: 'destructive',
  onPress: () => {
  if (isInTrash) {
  deletePhoto(photo.id);
  } else {
  moveToTrash(photo.uri, photo.width, photo.height);
  }
  router.back();
  },
  },
  ]
  );
  };const handleRecover = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  recoverFromTrash(photo.id);
  router.back();
  };return (
  <SafeAreaView className="flex-1 bg-gray-950">
  <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
  {/* Header */}
  <View className="absolute top-0 left-0 right-0 z-10 pt-4 pb-6 px-6 bg-gradient-to-b from-black/90 to-transparent">
  <TouchableOpacity
  onPress={() => router.back()}
  className="bg-white/10 backdrop-blur-xl p-3 rounded-full self-start border border-white/20"
  >
  <Ionicons name="close" size={24} color="white" />
  </TouchableOpacity>
  </View>    {/* Imagen con zoom */}
      <GestureDetector gesture={gestures}>
        <Animated.View style={[animatedStyle, { width: '100%', minHeight: '60%', alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }]}>
          <Image
            source={{ uri: photo.uri }}
            className="w-[95%] h-[500px] rounded-3xl border-2 border-gray-800 shadow-2xl"
            resizeMode="cover"
          />
        </Animated.View>
      </GestureDetector>    {/* Hint de zoom */}
      <View className="items-center -mt-4 mb-6">
        <View className="bg-gray-800/80 px-5 py-2 rounded-full">
          <Text className="text-gray-300 text-xs font-medium">
            Toca 2 veces para zoom • Pellizca para ajustar
          </Text>
        </View>
      </View>    {/* Detalles */}
      <View className="px-6 pb-10">
        <Text className="text-white text-3xl font-black mb-6">Detalles</Text>      <View className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 border-2 border-gray-700 shadow-xl">
          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar" size={20} color="#10b981" />
            <Text className="text-gray-300 text-base ml-3 flex-1">
              {formattedDate}
            </Text>
          </View>        <View className="flex-row items-center">
            <Ionicons name={isInTrash ? 'trash' : 'images'} size={20} color={isInTrash ? '#f43f5e' : '#10b981'} />
            <Text className="text-gray-300 text-base ml-3">
              {isInTrash ? 'En papelera' : 'En galería'}
            </Text>
          </View>        {isInTrash && (
            <View className="mt-4 pt-4 border-t border-gray-700 flex-row items-center">
              <Ionicons name="time" size={20} color="#fbbf24" />
              <Text className="text-amber-400 text-base ml-3 font-semibold">
                {daysLeft} día{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>      {/* Botones de acción */}
        <View className="space-y-4">
          {isInTrash ? (
            <>
              <TouchableOpacity
                onPress={handleRecover}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/50"
              >
                <Ionicons name="arrow-undo" size={24} color="white" />
                <Text className="text-white text-lg font-bold ml-3">Recuperar a galería</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-gradient-to-r from-rose-600 to-rose-700 py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-rose-900/50"
              >
                <Ionicons name="trash" size={24} color="white" />
                <Text className="text-white text-lg font-bold ml-3">Eliminar permanentemente</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-gradient-to-r from-rose-600 to-rose-700 py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-rose-900/50"
            >
              <Ionicons name="trash" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-3">Mover a papelera</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
  }
  