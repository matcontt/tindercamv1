// app/(tabs)/camera.tsx (actualizado)
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import SwipeablePhotoCard from '@/components/SwipeablePhotoCard';

export default function CameraScreen() {
  const { isGalleryFull, saveToGallery, moveToTrash, galleryPhotos } = usePhotos();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-gray-200 text-xl">Solicitando permisos...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center px-8">
        <Text className="text-white text-2xl font-bold mb-6">Permiso requerido</Text>
        <Text className="text-gray-400 text-center text-lg mb-8">
          Necesitamos acceso a la cámara para tomar fotos
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-emerald-600 px-10 py-5 rounded-2xl shadow-lg shadow-emerald-900/30"
        >
          <Text className="text-white text-lg font-semibold">Permitir acceso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (isGalleryFull) {
      Alert.alert('Límite alcanzado', 'La galería está llena (15/15). Libera espacio para continuar.');
      return;
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setPhotoUri(photo.uri);
        setDimensions({ width: photo.width, height: photo.height });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwipeLeft = () => {
    if (photoUri) moveToTrash(photoUri, dimensions.width, dimensions.height);
    setPhotoUri(null);
  };

  const handleSwipeRight = () => {
    if (photoUri) saveToGallery(photoUri, dimensions.width, dimensions.height);
    setPhotoUri(null);
  };

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
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

          {/* Header con contador */}
          <View className="absolute top-0 left-0 right-0 px-6 pt-14 pb-6 bg-gradient-to-b from-black/70 to-transparent">
            <Text className="text-white text-xl font-semibold text-center">
              Cámara ({galleryPhotos.length}/15)
            </Text>
          </View>

          {/* Botón de captura grande y centrado */}
          <View className="absolute bottom-12 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={takePicture}
              disabled={isGalleryFull}
              className={`w-24 h-24 rounded-full border-4 border-gray-300 justify-center items-center shadow-2xl shadow-black/50 ${
                isGalleryFull ? 'opacity-50 bg-gray-600' : 'bg-white'
              }`}
            >
              <View className={`w-20 h-20 rounded-full ${isGalleryFull ? 'bg-gray-700' : 'bg-white'}`} />
            </TouchableOpacity>
            <Text className="text-gray-300 mt-4 text-base font-medium">
              {isGalleryFull ? 'Galería llena' : 'Toca para capturar'}
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}