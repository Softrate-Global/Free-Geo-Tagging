import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <View style={styles.container}>
      {/* 1. Gallery Button with last captured thumbnail preview */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.iconBtn}
        onPress={onOpenGallery}
        disabled={isProcessing}
      >
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.galleryPlaceholder}>
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* 2. Flashlight Toggle Icon Button */}
      {onToggleFlash && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.iconBtn, styles.circleBtn, flashMode === 'on' && styles.circleBtnActive]}
          onPress={onToggleFlash}
          disabled={isProcessing}
        >
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
          {flashMode === 'auto' && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>A</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* 3. Main Shutter Button */}
      <CaptureButton
        onPress={onCapture}
        disabled={!canCapture}
        isProcessing={isProcessing}
      />

      {/* 4. Switch Camera Facing Flip Icon Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.iconBtn, styles.circleBtn]}
        onPress={onSwitchCamera}
        disabled={isProcessing}
      >
        <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#000000',
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
