import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import SwipeablePhotoCard from '@/components/SwipeablePhotoCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function CameraScreen() {
  const { isGalleryFull, saveToGallery, moveToTrash, galleryPhotos } = usePhotos();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <Text>Solicitando permisos...</Text>;
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-900 to-black justify-center items-center px-8">
        <Ionicons name="camera-outline" size={120} color="#10b981" />
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Necesitamos acceso a tu cámara
        </Text>
        <Text className="text-gray-400 text-center mt-3 text-base leading-6">
          Para capturar momentos increíbles y crear tu galería personalizada
        </Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          className="bg-emerald-600 px-10 py-5 rounded-2xl mt-8 shadow-lg shadow-emerald-500/50"
        >
          <Text className="text-white text-lg font-bold">Permitir Acceso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (isGalleryFull) {
      Alert.alert('Galería llena', 'Límite de 15 fotos alcanzado. Libera espacio primero.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
    
    if (photo) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhotoUri(photo.uri);
      setDimensions({ width: photo.width, height: photo.height });
    }
  };

  const handleSwipeLeft = () => {
    if (photoUri) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      moveToTrash(photoUri, dimensions.width, dimensions.height);
    }
    setPhotoUri(null);
  };

  const handleSwipeRight = () => {
    if (photoUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      saveToGallery(photoUri, dimensions.width, dimensions.height);
    }
    setPhotoUri(null);
  };

  const flipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(flash === 'off' ? 'on' : flash === 'on' ? 'auto' : 'off');
  };

  const flashIcon = flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash' : 'flash-outline';

  const progress = (galleryPhotos.length / 15) * 100;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {photoUri ? (
        <SwipeablePhotoCard
          uri={photoUri}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      ) : (
        <>
          <CameraView 
            ref={cameraRef} 
            style={{ flex: 1 }} 
            facing={facing}
            flash={flash}
          />

          {/* Header con controles */}
          <View className="absolute top-0 left-0 right-0 pt-14 pb-6 px-6 bg-gradient-to-b from-black/80 to-transparent">
            <View className="flex-row justify-between items-center">
              {/* Flash */}
              <TouchableOpacity 
                onPress={toggleFlash} 
                className="bg-white/20 backdrop-blur-xl p-3.5 rounded-full border border-white/30"
              >
                <Ionicons name={flashIcon} size={24} color={flash === 'on' ? '#fbbf24' : 'white'} />
              </TouchableOpacity>

              {/* Progress */}
              <View className="bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/30">
                <Text className="text-white text-base font-bold">
                  {galleryPhotos.length}/15
                </Text>
              </View>

              {/* Flip */}
              <TouchableOpacity 
                onPress={flipCamera} 
                className="bg-white/20 backdrop-blur-xl p-3.5 rounded-full border border-white/30"
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${progress >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Botón de captura */}
          <View className="absolute bottom-0 left-0 right-0 pb-10 pt-6 px-6 bg-gradient-to-t from-black/80 to-transparent items-center">
            <TouchableOpacity
              onPress={takePicture}
              disabled={isGalleryFull}
              className={`w-24 h-24 rounded-full bg-white justify-center items-center shadow-2xl ${isGalleryFull ? 'opacity-30' : 'shadow-white/30'}`}
            >
              <View className="w-20 h-20 rounded-full border-4 border-black" />
            </TouchableOpacity>
            
            {isGalleryFull && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <Text className="text-rose-400 mt-3 text-sm font-semibold">
                  Galería llena - Libera espacio
                </Text>
              </Animated.View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}