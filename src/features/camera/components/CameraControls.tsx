import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Animated } from 'react-native';
import { FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { CaptureButton } from './CaptureButton';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

interface CameraControlsProps {
  onCapture: () => void;
  onSwitchCamera: () => void;
  onOpenGallery: () => void;
  isProcessing: boolean;
  canCapture: boolean;
  thumbnailUri?: string | null;
  flashMode?: FlashMode;
  onToggleFlash?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onSwitchCamera,
  onOpenGallery,
  isProcessing,
  canCapture,
  thumbnailUri,
  flashMode = 'off',
  onToggleFlash,
}) => {
  // Smooth animated rotation for thumbnail and icons based on device orientation
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    try {
      Accelerometer.setUpdateInterval(250);
      subscription = Accelerometer.addListener(({ x, y }) => {
        if (!isMounted) return;

        // Ignore when device is flat on a surface
        // Only rotate when held horizontally in landscape (|x| > |y|)
        let target = 0;
        if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 0.45) {
          // When tilted right (x > 0), rotate -90; when tilted left (x < 0), rotate 90
          target = x > 0 ? -90 : 90;
        } else {
          // In standard portrait: always 0 (upright), never flip upside down (180)
          target = 0;
        }

        Animated.spring(rotationAnim, {
          toValue: target,
          useNativeDriver: true,
          bounciness: 6,
          speed: 12,
        }).start();
      });
    } catch (err) {
      console.warn('Accelerometer sensor error:', err);
    }

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, [rotationAnim]);

  const rotateInterpolation = rotationAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* ──────── Left Section (flex: 1): Gallery Thumbnail + Flash ──────── */}
      <View style={styles.sideSlotLeft}>
        {/* 1. Gallery Button with auto-rotating thumbnail preview */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconBtn}
          onPress={onOpenGallery}
          disabled={isProcessing}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            {thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
            ) : (
              <View style={styles.galleryPlaceholder}>
                <Ionicons name="images-outline" size={22} color="#FFFFFF" />
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* 2. Flashlight Toggle Icon Button */}
        {onToggleFlash && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.iconBtn, styles.circleBtn, flashMode === 'on' && styles.circleBtnActive]}
            onPress={onToggleFlash}
            disabled={isProcessing}
          >
            <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
              <Ionicons
                name={
                  flashMode === 'on'
                    ? 'flash'
                    : flashMode === 'auto'
                    ? 'flash'
                    : 'flash-off'
                }
                size={22}
                color={flashMode === 'on' ? '#FBBF24' : '#FFFFFF'}
              />
            </Animated.View>
            {flashMode === 'auto' && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>A</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ──────── Center Section: Shutter Button (Dead Center on Screen) ──────── */}
      <View style={styles.centerSlot}>
        <CaptureButton
          onPress={onCapture}
          disabled={!canCapture}
          isProcessing={isProcessing}
        />
      </View>

      {/* ──────── Right Section (flex: 1): Camera Flip Button + Spacer for Perfect Symmetry ──────── */}
      <View style={styles.sideSlotRight}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.iconBtn, styles.circleBtn]}
          onPress={onSwitchCamera}
          disabled={isProcessing}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>

        {/* Empty matching spacer to keep Flip equidistant from Shutter as Flash */}
        <View style={styles.emptySpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 28, // Blank black space padding clearing the Android navigation gesture bar
    paddingHorizontal: spacing.lg,
    backgroundColor: '#000000',
    width: '100%',
  },
  sideSlotLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  centerSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sideSlotRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  emptySpacer: {
    width: 46,
    height: 46,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleBtnActive: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  autoBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  autoBadgeText: {
    ...typography.micro,
    color: '#000000',
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  galleryPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
});
