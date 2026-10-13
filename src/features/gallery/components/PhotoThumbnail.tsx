import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { formatAccuracy } from '../../../core/utils/locationFormatter';
import { formatCaptureDate } from '../../../core/utils/dateTimeFormatter';
import { typography } from '../../../core/theme/typography';

interface PhotoThumbnailProps {
  photo: PhotoMetadata;
  size: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  photo,
  size,
  onPress,
  onLongPress,
  isSelectionMode = false,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        { width: size, height: size },
        isSelected && styles.containerSelected,
      ]}
    >
      <Image
        source={{ uri: photo.processedUri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Selection Checkmark Badge */}
      {isSelectionMode && (
        <View style={styles.selectionBadge}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
          ) : (
            <View style={styles.unselectedCircle} />
          )}
        </View>
      )}

      <View style={styles.badgeOverlay}>
        <Text style={styles.badgeText}>
          {photo.location ? formatAccuracy(photo.location.accuracy) : 'NO GPS'}
        </Text>
      </View>
      <View style={styles.dateOverlay}>
        <Text style={styles.dateText}>{formatCaptureDate(photo.capturedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 1.5,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  containerSelected: {
    borderWidth: 2.5,
    borderColor: '#007AFF',
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 5,
  },
  unselectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    ...typography.micro,
    color: '#FFFFFF',
    fontSize: 9,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  dateText: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 8,
  },
});
