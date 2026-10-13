import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
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
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onSwitchCamera,
  onOpenGallery,
  isProcessing,
  canCapture,
  thumbnailUri,
}) => {
  return (
    <View style={styles.container}>
      {/* Gallery Button with last captured thumbnail preview */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.sideBtn}
        onPress={onOpenGallery}
        disabled={isProcessing}
      >
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.galleryPlaceholder}>
            <Text style={styles.sideBtnText}>GALLERY</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Main Shutter Button */}
      <CaptureButton
        onPress={onCapture}
        disabled={!canCapture}
        isProcessing={isProcessing}
      />

      {/* Switch Camera Facing Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.sideBtn}
        onPress={onSwitchCamera}
        disabled={isProcessing}
      >
        <View style={styles.flipPlaceholder}>
          <Text style={styles.sideBtnText}>FLIP</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  galleryPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  flipPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  sideBtnText: {
    ...typography.micro,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
