import React, { ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';

// 任意文字列だとReact Nativeのwidth型より広すぎてstyleに渡せないため、許可する形だけに絞る。
type ScreenSkeletonWidth = number | 'auto' | `${number}%`;

type ScreenSkeletonLineProps = {
  width?: ScreenSkeletonWidth;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

type ScreenSkeletonCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  backgroundColor?: string;
};

type ScreenStatusOverlayProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  visible?: boolean;
  floating?: boolean;
};

export function ScreenSkeletonLine({
  width = '100%',
  height = 14,
  style,
}: ScreenSkeletonLineProps) {
  const opacity = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.78,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 999,
          backgroundColor: colors.BROWN,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ScreenSkeletonCard({
  children,
  style,
  borderColor = colors.OCHER,
  backgroundColor = colors.DARK_BROWN,
}: ScreenSkeletonCardProps) {
  return (
    <View
      style={[
        {
          marginBottom: 12,
          borderWidth: 2,
          borderColor,
          borderRadius: 18,
          backgroundColor,
          paddingHorizontal: 16,
          paddingVertical: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScreenStatusOverlay({
  label = '更新中…',
  style,
  visible = true,
  floating = true,
}: ScreenStatusOverlayProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : -8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.OCHER,
          borderRadius: 999,
          backgroundColor: colors.DARK_BROWN,
          paddingHorizontal: 12,
          paddingVertical: 6,
          opacity,
          transform: [{ translateY }],
        },
        floating && {
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 20,
        },
        style,
      ]}
    >
      <ActivityIndicator size="small" color={colors.OCHER} />
      <Text
        className="ml-2 text-OCHER"
        style={{ fontFamily: fonts.body_regular, fontSize: 13 }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
