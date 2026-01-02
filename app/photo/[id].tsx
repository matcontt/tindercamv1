// app/photo/[id].tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Dimensions,ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { galleryPhotos, trashPhotos, deletePhoto, recoverFromTrash, moveToTrash } = usePhotos();

  const allPhotos = [...galleryPhotos, ...trashPhotos];
  const photo = allPhotos.find(p => p.id === id);

  // Zoom y pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedTranslationX = useSharedValue(0);
  const savedTranslationY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .onUpdate((event) => {
      translationX.value = savedTranslationX.value + event.translationX / scale.value;
      translationY.value = savedTranslationY.value + event.translationY / scale.value;
    })
    .onEnd(() => {
      savedTranslationX.value = translationX.value;
      savedTranslationY.value = translationY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translationX.value = withSpring(0);
      translationY.value = withSpring(0);
      savedTranslationX.value = 0;
      savedTranslationY.value = 0;
    });

  const gestures = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  if (!photo) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <Text className="text-white text-3xl font-bold mb-6">Foto no encontrada</Text>
        <Text className="text-gray-400 text-center text-lg mb-8">
          La foto con ID {id} no está disponible en galería ni papelera.
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
    : null;

  const handleDelete = () => {
    Alert.alert(
      isInTrash ? 'Eliminar permanentemente' : 'Mover a papelera',
      isInTrash
        ? '¿Seguro? Esta acción no se puede deshacer.'
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
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Imagen con zoom */}
        <GestureDetector gesture={gestures}>
          <Animated.View style={[animatedStyle, { width: '100%', alignItems: 'center' }]}>
            <Image
              source={{ uri: photo.uri }}
              className="w-full min-h-[50vh] max-h-[80vh] rounded-3xl border border-gray-800 shadow-2xl shadow-black/50"
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Info y acciones */}
        <View className="px-6 pb-10 mt-6">
          <Text className="text-white text-3xl font-bold mb-4">Detalles</Text>

          <View className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
            <Text className="text-gray-300 text-base mb-3">
              <Text className="font-semibold text-white">Fecha:</Text> {formattedDate}
            </Text>
            <Text className="text-gray-300 text-base">
              <Text className="font-semibold text-white">Estado:</Text> {isInTrash ? 'En papelera' : 'En galería'}
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
                <Text className="text-white text-lg font-semibold">Mover a papelera</Text>
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