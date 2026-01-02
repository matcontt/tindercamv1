import React from 'react';
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

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);

      if (absX > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;

        translateX.value = withTiming(direction * (SCREEN_WIDTH + 100), { duration: 300 });
        translateY.value = withTiming(translateY.value + event.velocityY * 0.1, { duration: 300 });

        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const animatedLikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    ),
  }));

  const animatedDislikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0]
    ),
  }));

  return (
    <View className="flex-1 justify-center items-center">
      <GestureDetector gesture={pan}>
        <Animated.View
          className="w-[90%] h-[70%] rounded-3xl overflow-hidden bg-black shadow-lg shadow-black/30"
          style={animatedCardStyle}
        >
          <Image
            source={{ uri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay LIKE */}
          <Animated.View
            className="absolute inset-0 justify-center items-center bg-green-600/30"
            style={animatedLikeStyle}
          >
            <View className="border-4 border-green-500 rounded-xl px-6 py-4 rotate-[-20deg]">
              <Text className="text-5xl font-bold text-green-500">❤️ SAVE</Text>
            </View>
          </Animated.View>

          {/* Overlay DISLIKE */}
          <Animated.View
            className="absolute inset-0 justify-center items-center bg-red-600/30"
            style={animatedDislikeStyle}
          >
            <View className="border-4 border-red-500 rounded-xl px-6 py-4 rotate-[20deg]">
              <Text className="text-5xl font-bold text-red-500">❌ SKIP</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}