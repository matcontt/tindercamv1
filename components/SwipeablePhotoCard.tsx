// components/SwipeablePhotoCard.tsx
import React, { useState } from 'react';
import { View, Image, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeablePhotoCardProps {
  uri: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeablePhotoCard({
  uri,
  onSwipeLeft,
  onSwipeRight,
}: SwipeablePhotoCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  
  const [showHint, setShowHint] = useState(true);
  const [hapticTriggered, setHapticTriggered] = useState(false);

  const triggerHaptic = () => {
    if (!hapticTriggered) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setHapticTriggered(true);
      setTimeout(() => setHapticTriggered(false), 200);
    }
  };

  const hideHint = () => {
    setShowHint(false);
  };

  // Gesto de zoom (pinch)
  const pinch = Gesture.Pinch()
    .onStart(() => {
      runOnJS(hideHint)();
    })
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 4));
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        focalX.value = withSpring(0);
        focalY.value = withSpring(0);
      } else {
        savedScale.value = scale.value;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  // Gesto de pan (arrastrar)
  const pan = Gesture.Pan()
    .onStart(() => {
      runOnJS(hideHint)();
    })
    .onUpdate((event) => {
      if (scale.value > 1.1) {
        // Si está en zoom, permitir exploración
        focalX.value = event.translationX;
        focalY.value = event.translationY;
      } else {
        // Si no hay zoom, permitir swipe
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.5; // Reducir movimiento vertical

        const absX = Math.abs(event.translationX);
        if (absX > SWIPE_THRESHOLD && !hapticTriggered) {
          runOnJS(triggerHaptic)();
        }
      }
    })
    .onEnd((event) => {
      if (scale.value > 1.1) {
        // Resetear exploración en zoom
        focalX.value = withSpring(0);
        focalY.value = withSpring(0);
      } else {
        const absX = Math.abs(event.translationX);

        if (absX > SWIPE_THRESHOLD) {
          const direction = event.translationX > 0 ? 1 : -1;
          
          Haptics.notificationAsync(
            direction > 0 
              ? Haptics.NotificationFeedbackType.Success 
              : Haptics.NotificationFeedbackType.Warning
          );

          translateX.value = withTiming(
            direction * (SCREEN_WIDTH + 100), 
            { duration: 300 }
          );
          translateY.value = withTiming(
            translateY.value + event.velocityY * 0.05, 
            { duration: 300 }
          );

          runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      }
    });

  // Doble tap para zoom rápido
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(hideHint)();
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

  const gestures = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { translateX: focalX.value },
        { translateY: focalY.value },
        { scale: scale.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const animatedLikeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.8, 1.1]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const animatedDislikeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0]
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1.1, 0.8]
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 0.3]
    );
    return { opacity };
  });

  return (
    <View className="flex-1 justify-center items-center bg-black">
      {/* Background gradient animado */}
      <Animated.View 
        style={[backgroundStyle]}
        className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-rose-500"
      />

      <GestureDetector gesture={gestures}>
        <Animated.View
          className="w-[94%] h-[78%] rounded-[32px] overflow-hidden shadow-2xl"
          style={[animatedCardStyle, { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20 }]}
        >
          <Image
            source={{ uri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay LIKE - Mejorado con gradiente */}
          <Animated.View
            className="absolute inset-0 justify-center items-center"
            style={[animatedLikeStyle]}
          >
            <View className="bg-emerald-500/30 absolute inset-0" />
            <View className="border-[8px] border-emerald-400 rounded-[28px] px-10 py-6 -rotate-[15deg] bg-black/20 backdrop-blur-sm">
              <Text className="text-7xl font-black text-emerald-400 tracking-widest drop-shadow-2xl">
                SAVE
              </Text>
            </View>
          </Animated.View>

          {/* Overlay DISLIKE - Mejorado con gradiente */}
          <Animated.View
            className="absolute inset-0 justify-center items-center"
            style={[animatedDislikeStyle]}
          >
            <View className="bg-rose-500/30 absolute inset-0" />
            <View className="border-[8px] border-rose-400 rounded-[28px] px-10 py-6 rotate-[15deg] bg-black/20 backdrop-blur-sm">
              <Text className="text-7xl font-black text-rose-400 tracking-widest drop-shadow-2xl">
                SKIP
              </Text>
            </View>
          </Animated.View>

          {/* Hint inicial animado */}
          {showHint && (
            <Animated.View 
              entering={FadeIn.delay(500)}
              exiting={FadeOut}
              className="absolute bottom-12 left-0 right-0 items-center"
            >
              <View className="bg-black/80 backdrop-blur-xl px-8 py-4 rounded-[24px] border-2 border-white/20">
                <Text className="text-white text-base font-bold text-center leading-6">
                  ← Desliza para decidir{'\n'}
                  <Text className="text-gray-300 text-sm">Pellizca para zoom</Text>
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Indicadores de acción flotantes - Mejorados */}
      <View className="absolute bottom-16 left-0 right-0 flex-row justify-between px-16">
        <View className="items-center">
          <View className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-[24px] shadow-2xl shadow-rose-500/50">
            <Ionicons name="close" size={36} color="white" />
          </View>
          <Text className="text-white text-sm mt-3 font-black tracking-wide">PAPELERA</Text>
        </View>
        
        <View className="items-center">
          <View className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-[24px] shadow-2xl shadow-emerald-500/50">
            <Ionicons name="heart" size={36} color="white" />
          </View>
          <Text className="text-white text-sm mt-3 font-black tracking-wide">GALERÍA</Text>
        </View>
      </View>
    </View>
  );
}

// Importar FadeIn y FadeOut
import { FadeIn, FadeOut } from 'react-native-reanimated';