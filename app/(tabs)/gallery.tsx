// app/(tabs)/gallery.tsx
import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Modal, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeIn, 
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LAYOUT } from '@/lib/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Gallery() {
  const { galleryPhotos, loading, moveToTrash } = usePhotos();
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Animaciones del modal
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const detailsTranslateY = useSharedValue(SCREEN_HEIGHT);

  const photo = galleryPhotos.find(p => p.uri === selectedPhoto);

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPhoto(null);
    setShowDetails(false);
    translateY.value = 0;
    scale.value = 1;
    savedScale.value = 1;
    focalX.value = 0;
    focalY.value = 0;
    detailsTranslateY.value = SCREEN_HEIGHT;
  };

  // Gesto para cerrar (swipe down)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= 1.1 && event.translationY > 0) {
        translateY.value = event.translationY;
      } else if (scale.value > 1) {
        focalX.value = event.translationX;
        focalY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (translateY.value > 150 && scale.value <= 1.1) {
        runOnJS(closeModal)();
      } else {
        translateY.value = withSpring(0);
        focalX.value = withSpring(0);
        focalY.value = withSpring(0);
      }
    });

  // Gesto de zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 5));
      runOnJS(setShowDetails)(false);
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        focalX.value = withSpring(0);
        focalY.value = withSpring(0);
      } else {
        savedScale.value = scale.value;
      }
    });

  // Doble tap para zoom
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        focalX.value = withSpring(0);
        focalY.value = withSpring(0);
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const gestures = Gesture.Simultaneous(panGesture, pinchGesture, doubleTap);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
    ],
    opacity: interpolate(translateY.value, [0, 300], [1, 0.5]),
  }));

  const detailsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: detailsTranslateY.value }],
  }));

  const toggleDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(!showDetails);
    detailsTranslateY.value = withSpring(showDetails ? SCREEN_HEIGHT : 0);
  };

  const handleShare = async () => {
    if (!photo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        url: photo.uri,
        message: 'Compartido desde TinderCam',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const handleDelete = () => {
    if (!photo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    moveToTrash(photo.uri, photo.width, photo.height);
    closeModal();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
        <View className="bg-emerald-500/10 p-8 rounded-[40px] mb-6">
          <Ionicons name="images-outline" size={80} color="#10b981" />
        </View>
        <Text className="text-gray-400 text-xl font-semibold">Cargando galería...</Text>
      </SafeAreaView>
    );
  }

  if (galleryPhotos.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center px-8">
        <View className="bg-emerald-500/10 p-8 rounded-[40px] mb-8">
          <Ionicons name="images-outline" size={120} color="#10b981" />
        </View>
        <Text className="text-white text-4xl font-black mb-4 tracking-tight">Galería vacía</Text>
        <Text className="text-gray-400 text-center text-lg leading-7">
          Captura momentos en la cámara y desliza{' '}
          <Text className="text-emerald-400 font-bold">→</Text> para guardarlos aquí
        </Text>
      </SafeAreaView>
    );
  }

  const formattedDate = photo ? new Date(photo.timestamp).toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '';

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-6 pb-5 border-b border-gray-800/50">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-4xl font-black tracking-tight">
              Galería
            </Text>
            <Text className="text-emerald-400 text-lg mt-1 font-bold">
              {galleryPhotos.length} {galleryPhotos.length === 1 ? 'foto' : 'fotos'}
            </Text>
          </View>
          <View className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-[24px] shadow-2xl shadow-emerald-500/40">
            <Ionicons name="images" size={32} color="white" />
          </View>
        </View>
      </View>

      {/* Grid de fotos */}
      <FlatList
        data={galleryPhotos}
        keyExtractor={(item) => item.id}
        numColumns={LAYOUT.GALLERY_COLUMNS}
        contentContainerStyle={{ padding: LAYOUT.GALLERY_GAP, paddingBottom: 32 }}
        columnWrapperStyle={{ gap: LAYOUT.GALLERY_GAP, marginBottom: LAYOUT.GALLERY_GAP }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 30).springify()}
            className="flex-1"
          >
            <TouchableOpacity
              className="aspect-square"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPhoto(item.uri);
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.uri }}
                className="w-full h-full rounded-[20px] border-2 border-gray-800"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* Modal Full-Screen estilo iOS */}
      <Modal
        visible={!!selectedPhoto}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <GestureDetector gesture={gestures}>
              <Animated.View style={[{ flex: 1 }, modalStyle]} className="justify-center items-center">
                {selectedPhoto && (
                  <Image
                    source={{ uri: selectedPhoto }}
                    className="w-full h-[80%]"
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </GestureDetector>

            {/* Header Controls */}
            <View className="absolute top-0 left-0 right-0 pt-16 pb-6 px-6 bg-gradient-to-b from-black via-black/80 to-transparent">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity
                  onPress={closeModal}
                  className="bg-white/10 backdrop-blur-2xl p-4 rounded-[20px] border border-white/20"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleShare}
                    className="bg-white/10 backdrop-blur-2xl p-4 rounded-[20px] border border-white/20"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleDelete}
                    className="bg-rose-500/20 backdrop-blur-2xl p-4 rounded-[20px] border border-rose-500/40"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={24} color="#f43f5e" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Botón de detalles */}
            <TouchableOpacity
              onPress={toggleDetails}
              className="absolute bottom-8 self-center bg-white/10 backdrop-blur-2xl px-8 py-4 rounded-[24px] border border-white/20"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="information-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold text-base">
                  {showDetails ? 'Ocultar' : 'Ver'} Detalles
                </Text>
                <Ionicons 
                  name={showDetails ? 'chevron-down' : 'chevron-up'} 
                  size={20} 
                  color="white" 
                />
              </View>
            </TouchableOpacity>

            {/* Panel de Detalles (desliza desde abajo) */}
            <Animated.View 
              style={[detailsStyle]}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-[32px] border-t-2 border-gray-800 px-6 pt-6 pb-12"
            >
              <View className="w-12 h-1.5 bg-gray-700 rounded-full self-center mb-6" />
              
              <Text className="text-white text-2xl font-black mb-6">Información</Text>

              <View className="space-y-4">
                <View className="flex-row items-start">
                  <Ionicons name="calendar" size={20} color="#10b981" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-400 text-sm font-medium mb-1">Fecha</Text>
                    <Text className="text-white text-base font-semibold">{formattedDate}</Text>
                  </View>
                </View>

                <View className="h-px bg-gray-800" />

                <View className="flex-row items-start">
                  <Ionicons name="resize" size={20} color="#10b981" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-400 text-sm font-medium mb-1">Dimensiones</Text>
                    <Text className="text-white text-base font-semibold">
                      {photo?.width} × {photo?.height} px
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-gray-800" />

                <View className="flex-row items-start">
                  <Ionicons name="images" size={20} color="#10b981" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-400 text-sm font-medium mb-1">Estado</Text>
                    <Text className="text-emerald-400 text-base font-semibold">En galería</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}