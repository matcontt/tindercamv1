// app/(tabs)/camera.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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

  if (!permission) return <Text>Solicitando permisos...</Text>;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white mb-4">Necesitamos permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 px-6 py-3 rounded">
          <Text className="text-white">Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (isGalleryFull) {
      Alert.alert('Galería llena', 'Límite de 15 fotos alcanzado');
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

  if (photoUri) {
    return (
      <SwipeablePhotoCard
        uri={photoUri}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <View className="absolute bottom-20 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={takePicture}
          className="w-20 h-20 rounded-full bg-white justify-center items-center border-4 border-gray-300"
        >
          <View className="w-16 h-16 rounded-full bg-white" />
        </TouchableOpacity>
        <Text className="text-white mt-2">{galleryPhotos.length}/15</Text>
      </View>
    </View>
  );
}