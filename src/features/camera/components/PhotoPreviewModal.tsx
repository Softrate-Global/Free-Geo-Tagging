import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  PanResponder,
  useWindowDimensions,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { WatermarkTemplate } from '../../watermark/components/WatermarkTemplate';
import { WatermarkData } from '../../watermark/types/watermarkTypes';
import { WatermarkService } from '../../watermark/services/watermarkService';
import { ShareService } from '../../gallery/services/shareService';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';
import { formatDigitalStamp } from '../../../core/utils/dateTimeFormatter';

interface PhotoPreviewModalProps {
  visible: boolean;
  photoUri: string | null;
  photoWidth?: number;
  photoHeight?: number;
  watermarkData: WatermarkData | null;
  onSave: (finalWatermarkedUri: string) => Promise<void>;
  onDelete: () => void;
  isSaving?: boolean;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  visible,
  photoUri,
  photoWidth = 3,
  photoHeight = 4,
  watermarkData,
  onSave,
  onDelete,
  isSaving = false,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const canvasRef = useRef<any>(null);

  // Compute canvas dimensions matching photo aspect ratio
  const maxCanvasHeight = screenHeight - 150; // Leave room for gallery top & bottom bars
  const photoAspect = (photoWidth || 3) / (photoHeight || 4);

  let canvasWidth = screenWidth;
  let canvasHeight = Math.round(canvasWidth / photoAspect);

  if (canvasHeight > maxCanvasHeight) {
    canvasHeight = maxCanvasHeight;
    canvasWidth = Math.round(canvasHeight * photoAspect);
  }

  // Vertical position bounds for the watermark
  const minY = 16; // Top bound
  const maxY = Math.max(minY, canvasHeight - 112); // Bottom bound

  const currentY = useRef(maxY);
  const translateY = useRef(new Animated.Value(maxY)).current;

  // Track position state for quick jump buttons
  const [activePosition, setActivePosition] = useState<'top' | 'bottom' | 'custom'>('bottom');

  useEffect(() => {
    translateY.setValue(maxY);
    currentY.current = maxY;
  }, [maxY]);

  const snapTo = (targetY: number, posName: 'top' | 'bottom' | 'custom') => {
    currentY.current = targetY;
    setActivePosition(posName);
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  };

  // PanResponder to allow swiping / dragging watermark up & down
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        const nextY = Math.min(maxY, Math.max(minY, currentY.current + gesture.dy));
        translateY.setValue(nextY);
      },
      onPanResponderRelease: (_, gesture) => {
        let finalY = currentY.current + gesture.dy;

        // Check for vertical swipe gesture velocity
        if (gesture.vy < -0.5) {
          // Swiped UP fast
          snapTo(minY, 'top');
        } else if (gesture.vy > 0.5) {
          // Swiped DOWN fast
          snapTo(maxY, 'bottom');
        } else {
          // Positioned manually by dragging
          finalY = Math.min(maxY, Math.max(minY, finalY));
          currentY.current = finalY;

          if (Math.abs(finalY - minY) < 30) {
            snapTo(minY, 'top');
          } else if (Math.abs(finalY - maxY) < 30) {
            snapTo(maxY, 'bottom');
          } else {
            setActivePosition('custom');
            Animated.spring(translateY, {
              toValue: finalY,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        }
      },
    })
  ).current;

  const [isSharing, setIsSharing] = useState(false);

  const handleSharePhoto = async () => {
    if (isSaving || isSharing) return;

    try {
      setIsSharing(true);
      let shareUri = photoUri;
      if (canvasRef.current && watermarkData) {
        shareUri = await WatermarkService.compositeWatermark(canvasRef);
      }

      if (shareUri) {
        await ShareService.shareSinglePhoto(shareUri, 'Share Photograph to WhatsApp');
      }
    } catch (err: any) {
      console.warn('Share error from preview:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCaptureAndSave = async () => {
    if (isSaving) return;

    try {
      if (canvasRef.current && watermarkData) {
        // Rasterize the canvas with image and watermark at user's chosen vertical position
        const compositeUri = await WatermarkService.compositeWatermark(canvasRef);
        await onSave(compositeUri);
      } else if (photoUri) {
        await onSave(photoUri);
      }
    } catch (err) {
      console.error('Error saving watermarked photo from preview:', err);
      if (photoUri) {
        await onSave(photoUri);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (isSaving || isSharing) return;

    Alert.alert(
      'DELETE PHOTOGRAPH',
      'Are you sure you want to delete this photo without saving?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleConfirmDelete();
      return true;
    });
    return () => sub.remove();
  }, [visible, isSaving, isSharing]);

  if (!visible || !photoUri) return null;

  return (
    <View style={styles.fullScreenOverlay}>
      <View style={styles.container}>
        {/* ──────── TOP GALLERY HEADER ──────── */}
        <SafeAreaView style={styles.topBarContainer} edges={['top']}>
          <View style={styles.topBar}>
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerIconBtn}
              onPress={handleConfirmDelete}
              disabled={isSaving}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Gallery Title */}
            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitle}>PHOTO PREVIEW</Text>
              <Text style={styles.headerSubtitle}>
                {watermarkData?.placeName || 'GPS Location'}
              </Text>
            </View>

            {/* Quick Position Selector Pills: TOP | BOTTOM */}
            <View style={styles.positionSelector}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.posPill,
                  activePosition === 'top' && styles.posPillActive,
                ]}
                onPress={() => snapTo(minY, 'top')}
                disabled={isSaving}
              >
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={activePosition === 'top' ? '#000000' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.posPillText,
                    activePosition === 'top' && styles.posPillTextActive,
                  ]}
                >
                  TOP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.posPill,
                  activePosition === 'bottom' && styles.posPillActive,
                ]}
                onPress={() => snapTo(maxY, 'bottom')}
                disabled={isSaving}
              >
                <Ionicons
                  name="arrow-down"
                  size={12}
                  color={activePosition === 'bottom' ? '#000000' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.posPillText,
                    activePosition === 'bottom' && styles.posPillTextActive,
                  ]}
                >
                  BOTTOM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* ──────── CENTER PHOTO CANVAS ──────── */}
        <View style={styles.canvasWrapper}>
          <ViewShot
            ref={canvasRef}
            options={{ format: 'jpg', quality: 0.95, result: 'tmpfile' }}
            style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
          >
            {/* Captured Base Photo */}
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={[StyleSheet.absoluteFill, { width: canvasWidth, height: canvasHeight }]}
                resizeMode="cover"
              />
            ) : null}


            {/* Swipeable / Draggable Location Watermark */}
            {watermarkData && (
              <Animated.View
                style={[
                  styles.watermarkContainer,
                  {
                    transform: [{ translateY }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <WatermarkTemplate data={watermarkData} scale={1} />
              </Animated.View>
            )}
          </ViewShot>
        </View>

        {/* ──────── BOTTOM GALLERY TOOLBAR ──────── */}
        <SafeAreaView style={styles.bottomBarContainer} edges={['bottom']}>
          <View style={styles.bottomToolbar}>
            {/* Discard / Delete Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.deleteCircleBtn}
              onPress={handleConfirmDelete}
              disabled={isSaving || isSharing}
            >
              <Ionicons name="trash-outline" size={22} color="#FF453A" />
            </TouchableOpacity>

            {/* Share to WhatsApp / Apps Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.shareCircleBtn}
              onPress={handleSharePhoto}
              disabled={isSaving || isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Save to Gallery Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.saveGalleryBtn}
              onPress={handleCaptureAndSave}
              disabled={isSaving || isSharing}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#000000" style={styles.saveBtnIcon} />
                  <Text style={styles.saveGalleryText}>SAVE TO GALLERY</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: '#000000',
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },

  /* ──────── Top Header Bar ──────── */
  topBarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  headerSubtitle: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    marginTop: 1,
  },
  positionSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 2,
    alignItems: 'center',
  },
  posPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 3,
  },
  posPillActive: {
    backgroundColor: '#FFFFFF',
  },
  posPillText: {
    ...typography.micro,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  posPillTextActive: {
    color: '#000000',
  },

  /* ──────── Center Canvas ──────── */
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  canvas: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ──────── Bottom Gallery Toolbar ──────── */
  bottomBarContainer: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 10,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  deleteCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  saveGalleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
  },
  saveBtnIcon: {
    marginRight: 6,
  },
  saveGalleryText: {
    ...typography.captionBold,
    color: '#000000',
    fontWeight: '800',
    letterSpacing: 0.8,
    fontSize: 12.5,
  },
  /* ──────── Top-Right Retro Digital Camera Stamp ──────── */
  topRightDigitalStamp: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
  },
  digitalStampText: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
