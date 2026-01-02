// app/(tabs)/camera.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePhotos } from '@/lib/contexts/PhotoContext';
import SwipeablePhotoCard from '@/components/SwipeablePhotoCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const { isGalleryFull, saveToGallery, moveToTrash, galleryPhotos } = usePhotos();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [facing, setFacing] = useState<CameraType>('back'); // Estado para flip
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <Text>Solicitando permisos...</Text>;
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white mb-4">Necesitamos permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 px-6 py-3 rounded">
          <Text className="text-white">Permitir</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (isGalleryFull) {
      Alert.alert('Galería llena', 'Límite de 15 fotos alcanzado');
      return;
    }
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo) {
      setPhotoUri(photo.uri);
      setDimensions({ width: photo.width, height: photo.height });
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

  const flipCamera = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
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
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

          {/* Botón flip */}
          <TouchableOpacity onPress={flipCamera} className="absolute top-12 right-6 bg-black/50 p-3 rounded-full">
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>

          <View className="absolute bottom-12 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={takePicture}
              disabled={isGalleryFull}
              className={`w-20 h-20 rounded-full bg-white justify-center items-center ${isGalleryFull ? 'opacity-50' : ''}`}
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </TouchableOpacity>
            <Text className="text-white mt-3 text-sm">
              {galleryPhotos.length}/15
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}