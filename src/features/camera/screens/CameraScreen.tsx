import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  Alert,
  AppState,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';

import * as Location from 'expo-location';
import { useLocation } from '../../location/hooks/useLocation';
import { LocationService } from '../../location/services/locationService';
import { LocationStatus } from '../components/LocationStatus';
import { LocationRequiredModal } from '../components/LocationRequiredModal';
import { CameraControls } from '../components/CameraControls';
import { FlashButton } from '../components/FlashButton';
import { WatermarkTemplate } from '../../watermark/components/WatermarkTemplate';
import { PermissionRequestView } from '../../../shared/components/PermissionRequestView';

import { CameraService } from '../services/cameraService';
import { WatermarkService } from '../../watermark/services/watermarkService';
import { GalleryService } from '../../gallery/services/galleryService';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';
import { PermissionService } from '../../permissions/services/permissionService';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePhotoFilename } from '../../../core/utils/filenameGenerator';
import { PhotoMetadata, GPSStatus, LocationData, PhotoAspectRatio } from '../../../shared/types/photoTypes';
import { WatermarkData } from '../../watermark/types/watermarkTypes';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import { EditLocationModal } from '../components/EditLocationModal';
import { CustomLocationService } from '../../location/services/customLocationService';

const STORAGE_KEY_PHOTO_RATIO = '@camera_photo_aspect_ratio_v1';
const RATIO_ORDER: PhotoAspectRatio[] = ['4:3', '16:9', '1:1', 'FULL'];

interface PendingCapture {
  photoUri: string;
  captureTimestamp: number;
  width: number;
  height: number;
  location: LocationData | null;
  gpsStatus: GPSStatus;
  watermarkData: WatermarkData;
}

interface CameraScreenProps {
  navigation: any;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  // Camera Settings
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Zoom Settings & Pinch Gesture
  const [zoom, setZoom] = useState(0);
  const zoomRef = useRef(0);
  const baseZoomRef = useRef(0);
  const initialDistanceRef = useRef<number | null>(null);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerZoomFeedback = () => {
    setShowZoomIndicator(true);
    if (zoomHideTimeoutRef.current) {
      clearTimeout(zoomHideTimeoutRef.current);
    }
    zoomHideTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 1500);
  };

  const applyZoom = (targetZoom: number) => {
    const clamped = Math.min(1, Math.max(0, targetZoom));
    zoomRef.current = clamped;
    baseZoomRef.current = clamped;
    setZoom(clamped);
    triggerZoomFeedback();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          const t1 = evt.nativeEvent.touches[0];
          const t2 = evt.nativeEvent.touches[1];
          const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
          initialDistanceRef.current = dist;
          baseZoomRef.current = zoomRef.current;
          triggerZoomFeedback();
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          const t1 = evt.nativeEvent.touches[0];
          const t2 = evt.nativeEvent.touches[1];
          const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
          if (initialDistanceRef.current === null) {
            initialDistanceRef.current = dist;
            baseZoomRef.current = zoomRef.current;
          } else {
            const delta = dist - initialDistanceRef.current;
            // 220px delta across screen moves zoom from 0 to 1
            const newZoom = Math.min(1, Math.max(0, baseZoomRef.current + delta / 220));
            zoomRef.current = newZoom;
            setZoom(newZoom);
            triggerZoomFeedback();
          }
        } else {
          initialDistanceRef.current = null;
          baseZoomRef.current = zoomRef.current;
        }
      },
      onPanResponderRelease: () => {
        initialDistanceRef.current = null;
        baseZoomRef.current = zoomRef.current;
      },
      onPanResponderTerminate: () => {
        initialDistanceRef.current = null;
        baseZoomRef.current = zoomRef.current;
      },
    })
  ).current;

  useEffect(() => {
    return () => {
      if (zoomHideTimeoutRef.current) {
        clearTimeout(zoomHideTimeoutRef.current);
      }
    };
  }, []);

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [isRequestingPerms, setIsRequestingPerms] = useState(false);

  // GPS Sensor Hook
  const { currentLocation, gpsStatus, isAcquiring, refreshLocation } = useLocation();

  // Processing & Compositing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [frozenPhotoUri, setFrozenPhotoUri] = useState<string | null>(null);
  const [lastThumbnailUri, setLastThumbnailUri] = useState<string | null>(null);

  // Pending Photo Preview State (Before saving to gallery)
  const [pendingPhoto, setPendingPhoto] = useState<PendingCapture | null>(null);
  const [isSavingPending, setIsSavingPending] = useState(false);

  // Custom Location Override State
  const [isEditLocationModalVisible, setIsEditLocationModalVisible] = useState(false);
  const [customOverrideLocation, setCustomOverrideLocation] = useState<{
    placeName: string;
    subAddress: string;
    formattedAddress: string;
  } | null>(null);

  // Location Required Popup Modal State
  const [isLocationRequiredModalVisible, setIsLocationRequiredModalVisible] = useState(false);

  // Photo Aspect Ratio State ('4:3', '16:9', '1:1', 'FULL')
  const [photoRatio, setPhotoRatio] = useState<PhotoAspectRatio>('4:3');
  const [ratioBadge, setRatioBadge] = useState<string | null>(null);
  const ratioBadgeTimeoutRef = useRef<any>(null);

  // Load saved aspect ratio on launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_PHOTO_RATIO)
      .then((val) => {
        if (val && RATIO_ORDER.includes(val as PhotoAspectRatio)) {
          setPhotoRatio(val as PhotoAspectRatio);
        }
      })
      .catch(() => {});
  }, []);

  const handleCycleRatio = useCallback(() => {
    setPhotoRatio((current) => {
      const idx = RATIO_ORDER.indexOf(current);
      const next = RATIO_ORDER[(idx + 1) % RATIO_ORDER.length];
      AsyncStorage.setItem(STORAGE_KEY_PHOTO_RATIO, next).catch(() => {});

      const label =
        next === '4:3'
          ? '4:3 (Standard)'
          : next === '16:9'
          ? '16:9 (Cinematic)'
          : next === '1:1'
          ? '1:1 (Square)'
          : 'Full Screen';

      setRatioBadge(label);
      if (ratioBadgeTimeoutRef.current) {
        clearTimeout(ratioBadgeTimeoutRef.current);
      }
      ratioBadgeTimeoutRef.current = setTimeout(() => {
        setRatioBadge(null);
      }, 1600);

      return next;
    });
  }, []);

  const effectiveLocation: LocationData | null = useMemo(() => {
    if (!currentLocation) return null;
    return {
      ...currentLocation,
      placeName: customOverrideLocation?.placeName ?? currentLocation.placeName,
      subAddress: customOverrideLocation?.subAddress ?? currentLocation.subAddress,
      formattedAddress: customOverrideLocation?.formattedAddress ?? currentLocation.formattedAddress,
    };
  }, [currentLocation, customOverrideLocation]);

  const handleSaveCustomLocation = useCallback(async (data: {
    placeName: string;
    subAddress: string;
    formattedAddress: string;
  }) => {
    if (currentLocation) {
      await CustomLocationService.saveLocation(
        currentLocation.latitude,
        currentLocation.longitude,
        data
      );
    }
    setCustomOverrideLocation(data);
  }, [currentLocation]);

  const handleResetCustomLocation = useCallback(async () => {
    if (currentLocation) {
      await CustomLocationService.clearSavedLocation(
        currentLocation.latitude,
        currentLocation.longitude
      );
    }
    setCustomOverrideLocation(null);
    refreshLocation();
  }, [currentLocation, refreshLocation]);

  // Off-screen compositing state
  const [compositeImage, setCompositeImage] = useState<{
    uri: string;
    width: number;
    height: number;
    watermarkData: WatermarkData;
  } | null>(null);

  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef<any>(null);

  // Check initial permissions
  useEffect(() => {
    async function checkPermissions() {
      const all = await PermissionService.checkAllPermissions();
      setHasMediaPermission(all.mediaGranted);
    }
    checkPermissions();

    // Load recent photo thumbnail (either from app storage or device gallery)
    async function loadRecentThumbnail() {
      try {
        const photos = await LocalMetadataService.getAllPhotos();
        if (photos.length > 0) {
          setLastThumbnailUri(photos[0].processedUri);
          return;
        }

        // Fallback to most recent photo from device album
        const MediaLibrary = await import('expo-media-library/legacy');
        const perm = await MediaLibrary.getPermissionsAsync(false, ['photo']).catch(() => ({ granted: false }));
        if (perm && perm.granted) {
          const result = await MediaLibrary.getAssetsAsync({
            first: 1,
            sortBy: [MediaLibrary.SortBy.creationTime],
            mediaType: [MediaLibrary.MediaType.photo],
          });
          if (result && result.assets && result.assets.length > 0) {
            setLastThumbnailUri(result.assets[0].uri);
          }
        }
      } catch (err) {
        console.warn('loadRecentThumbnail error:', err);
      }
    }
    loadRecentThumbnail();
  }, []);

  const refreshLocationRef = useRef(refreshLocation);
  refreshLocationRef.current = refreshLocation;

  // Re-check permissions when returning from device Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshLocationRef.current();
        PermissionService.checkAllPermissions().then((all) => {
          setHasMediaPermission(all.mediaGranted);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleRequestAllPermissions = async () => {
    try {
      setIsRequestingPerms(true);
      await PermissionService.requestPermissionsSequentially();
      const all = await PermissionService.checkAllPermissions();
      setHasMediaPermission(all.mediaGranted);
      await refreshLocation();

      if (!all.cameraGranted || !all.locationGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and Location permissions are required for the live viewfinder and offline GPS watermarking. Please enable them in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: PermissionService.openSettings },
          ]
        );
      }
    } catch (err) {
      console.warn('Error requesting permissions:', err);
    } finally {
      setIsRequestingPerms(false);
    }
  };

  const handleToggleFacing = useCallback(() => {
    setFacing((cur) => (cur === 'back' ? 'front' : 'back'));
  }, []);

  const handleToggleFlash = useCallback(() => {
    setFlash((cur) => (cur === 'off' ? 'on' : cur === 'on' ? 'auto' : 'off'));
  }, []);

  // Complete Photo Capture & Watermark Compositing Pipeline
  const handleCapture = async () => {
    if (isProcessing || !cameraRef.current) return;

    // Check if location is turned on before taking photograph
    const isServicesEnabled = await PermissionService.isLocationServicesEnabled();
    const locPerm = await Location.getForegroundPermissionsAsync();

    if (
      !isServicesEnabled ||
      !locPerm.granted ||
      gpsStatus === 'SERVICES_DISABLED' ||
      gpsStatus === 'PERMISSION_DENIED'
    ) {
      setIsLocationRequiredModalVisible(true);
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus('Capturing photograph...');

      const captureTimestamp = Date.now();

      // Step 1: Capture raw photo from camera hardware
      const rawPhoto = await CameraService.capturePhoto(cameraRef.current);
      // Freeze the shuttered photo on screen immediately
      setFrozenPhotoUri(rawPhoto.uri);

      // Step 2: Normalize image orientation
      setProcessingStatus('Normalizing orientation...');
      const normalized = await WatermarkService.normalizeImage(rawPhoto.uri);

      // Step 2.5: Apply chosen aspect ratio crop (4:3, 16:9, 1:1, or FULL)
      setProcessingStatus('Framing aspect ratio...');
      const framedPhoto = await WatermarkService.applyAspectRatio(
        normalized.uri,
        rawPhoto.width,
        rawPhoto.height,
        photoRatio
      );

      // Step 3: Prepare watermark parameters with Google Maps place name
      setProcessingStatus('Resolving location details...');
      let finalLocation = effectiveLocation;
      if (finalLocation && (!finalLocation.placeName || !finalLocation.formattedAddress)) {
        try {
          const geo = await LocationService.reverseGeocode(
            finalLocation.latitude,
            finalLocation.longitude
          );
          if (geo) {
            finalLocation = {
              ...finalLocation,
              placeName: finalLocation.placeName || geo.placeName,
              subAddress: finalLocation.subAddress || geo.subAddress,
              formattedAddress: finalLocation.formattedAddress || geo.formattedAddress,
            };
          }
        } catch {}
      }

      setProcessingStatus('Preparing preview...');
      const watermarkData = WatermarkService.prepareWatermarkData(
        finalLocation,
        captureTimestamp
      );

      // Open Photo Preview Modal for user to swipe/position watermark and save
      setPendingPhoto({
        photoUri: framedPhoto.uri,
        captureTimestamp,
        width: framedPhoto.width,
        height: framedPhoto.height,
        location: finalLocation,
        gpsStatus,
        watermarkData,
      });
    } catch (err: any) {
      console.error('Capture pipeline error:', err);
      Alert.alert(
        'Capture Failed',
        err.message || 'An error occurred while capturing the photograph.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setFrozenPhotoUri(null);
    }
  };

  const handleDiscardPendingPhoto = () => {
    setPendingPhoto(null);
  };

  const handleGoToLocationSettings = async () => {
    setIsLocationRequiredModalVisible(false);
    await PermissionService.openLocationSettings();
    refreshLocation();
  };

  const handleSavePendingPhoto = async (finalWatermarkedUri: string) => {
    if (!pendingPhoto || isSavingPending) return;

    try {
      setIsSavingPending(true);
      const filename = generatePhotoFilename(pendingPhoto.captureTimestamp);
      const { assetId, publicUri } = await GalleryService.saveToPublicGallery(
        finalWatermarkedUri,
        filename
      );

      const photoMetadata: PhotoMetadata = {
        id: `photo_${pendingPhoto.captureTimestamp}`,
        filename,
        mediaAssetId: assetId,
        processedUri: publicUri,
        width: pendingPhoto.width,
        height: pendingPhoto.height,
        location: pendingPhoto.location,
        locationStatus: pendingPhoto.gpsStatus,
        capturedAt: pendingPhoto.captureTimestamp,
        processedAt: Date.now(),
        watermarkApplied: true,
      };

      await LocalMetadataService.savePhoto(photoMetadata);
      setLastThumbnailUri(publicUri);
      setPendingPhoto(null);
    } catch (err: any) {
      console.error('Save to gallery error:', err);
      Alert.alert(
        'Save Failed',
        err.message || 'An error occurred while saving the photograph to your gallery.'
      );
    } finally {
      setIsSavingPending(false);
    }
  };

  // Permission Guard: Camera is the prerequisite that requires rendering PermissionRequestView instead of the viewfinder
  const needsPermission = !cameraPermission?.granted;

  if (needsPermission) {
    return (
      <PermissionRequestView
        cameraMissing={!cameraPermission?.granted}
        locationMissing={gpsStatus === 'PERMISSION_DENIED'}
        mediaMissing={hasMediaPermission === false}
        loading={isRequestingPerms}
        onRequestPermissions={handleRequestAllPermissions}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera Viewfinder */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        zoom={zoom}
        ratio={photoRatio === '1:1' ? '1:1' : photoRatio === '16:9' ? '16:9' : '4:3'}
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* Frozen Shuttered Still Frame during capture processing */}
      {frozenPhotoUri && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={{ uri: frozenPhotoUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      )}

      {/* 1:1 Square Viewfinder Framing Guide Scrim */}
      {photoRatio === '1:1' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.squareMaskTop} />
          <View style={styles.squareFrame} />
          <View style={styles.squareMaskBottom} />
        </View>
      )}

      <SafeAreaView style={styles.overlayContainer} edges={['top']}>
        {/* Top Header Bar (Branding) */}
        <View style={styles.topBar}>
          <Text style={styles.appBranding}>FREE GEO TAGGING</Text>
        </View>

        {/* Center Loading Indicator during capture processing on top of frozen frame */}
        {isProcessing && (
          <View style={styles.frozenLoaderOverlay} pointerEvents="none">
            <View style={styles.frozenLoaderBox}>
              <ActivityIndicator size="large" color="#FFD700" style={{ marginBottom: 12 }} />
              <Text style={styles.frozenLoaderTitle}>PROCESSING PHOTO</Text>
              {processingStatus ? (
                <Text style={styles.frozenLoaderText}>{processingStatus}</Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Viewfinder Pinch to Zoom Gesture Zone */}
        <View
          style={styles.viewfinderPinchArea}
          collapsable={false}
          {...panResponder.panHandlers}
        >
          {/* Floating Aspect Ratio Toast Badge */}
          {ratioBadge && (
            <View style={styles.ratioBadgeContainer} pointerEvents="none">
              <View style={styles.ratioBadge}>
                <Ionicons name="crop" size={14} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.ratioBadgeText}>{ratioBadge}</Text>
              </View>
            </View>
          )}

          {/* Floating Zoom Indicator while pinching */}
          {showZoomIndicator && (
            <View style={styles.zoomBadgeContainer} pointerEvents="none">
              <View style={styles.zoomBadge}>
                <Ionicons name="scan-outline" size={13} color="#FFD700" style={{ marginRight: 4 }} />
                <Text style={styles.zoomBadgeText}>
                  {(1 + zoom * 4).toFixed(1)}x
                </Text>
              </View>
            </View>
          )}

          {/* Quick Zoom Switcher Pills (1x, 2x) */}
          <View style={styles.quickZoomContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.quickZoomBtn,
                Math.abs(zoom - 0) < 0.05 && styles.quickZoomBtnActive,
              ]}
              onPress={() => applyZoom(0)}
            >
              <Text
                style={[
                  styles.quickZoomText,
                  Math.abs(zoom - 0) < 0.05 && styles.quickZoomTextActive,
                ]}
              >
                1x
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.quickZoomBtn,
                Math.abs(zoom - 0.25) < 0.05 && styles.quickZoomBtnActive,
              ]}
              onPress={() => applyZoom(0.25)}
            >
              <Text
                style={[
                  styles.quickZoomText,
                  Math.abs(zoom - 0.25) < 0.05 && styles.quickZoomTextActive,
                ]}
              >
                2x
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Solid Black Unified Bottom Console (GPS HUD + Controls with Flash & Flip) */}
        <View style={styles.bottomConsole}>
          {/* GPS Live Status & Coordinates HUD */}
          <LocationStatus
            status={gpsStatus}
            location={effectiveLocation}
            onRefresh={refreshLocation}
            onEditLocation={() => setIsEditLocationModalVisible(true)}
            onTurnOnLocation={handleGoToLocationSettings}
          />

          {/* Bottom Controls Bar (Gallery, Flashlight, Shutter, Flip, Ratio Switcher) */}
          <CameraControls
            onCapture={handleCapture}
            onSwitchCamera={handleToggleFacing}
            onOpenGallery={() => navigation.navigate('Gallery')}
            isProcessing={isProcessing}
            canCapture={isCameraReady && !isProcessing}
            thumbnailUri={lastThumbnailUri}
            flashMode={flash}
            onToggleFlash={handleToggleFlash}
            photoRatio={photoRatio}
            onToggleRatio={handleCycleRatio}
          />
        </View>
      </SafeAreaView>

      {/* Full Screen Photo Capture Preview with Swipeable Watermark */}
      <PhotoPreviewModal
        visible={!!pendingPhoto}
        photoUri={pendingPhoto?.photoUri || null}
        photoWidth={pendingPhoto?.width}
        photoHeight={pendingPhoto?.height}
        watermarkData={pendingPhoto?.watermarkData || null}
        onDelete={handleDiscardPendingPhoto}
        onSave={handleSavePendingPhoto}
        isSaving={isSavingPending}
      />

      {/* Manual Location & Address Customization Modal */}
      {effectiveLocation && (
        <EditLocationModal
          visible={isEditLocationModalVisible}
          latitude={effectiveLocation.latitude}
          longitude={effectiveLocation.longitude}
          initialPlaceName={effectiveLocation.placeName || ''}
          initialSubAddress={effectiveLocation.subAddress || ''}
          initialFormattedAddress={effectiveLocation.formattedAddress || ''}
          onSave={handleSaveCustomLocation}
          onReset={handleResetCustomLocation}
          onClose={() => setIsEditLocationModalVisible(false)}
        />
      )}
      {/* Location Required Popup Banner */}
      <LocationRequiredModal
        visible={isLocationRequiredModalVisible}
        onGoToSettings={handleGoToLocationSettings}
        onClose={() => setIsLocationRequiredModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  appBranding: {
    ...typography.watermarkHeading,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontSize: 14,
  },
  ratioBadgeContainer: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    zIndex: 25,
  },
  ratioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  ratioBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  squareMaskTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    width: '100%',
  },
  squareFrame: {
    width: '100%',
    aspectRatio: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  squareMaskBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    width: '100%',
  },
  viewfinderPinchArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  zoomBadgeContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 20,
  },
  zoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  zoomBadgeText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickZoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: spacing.xs,
  },
  quickZoomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  quickZoomBtnActive: {
    backgroundColor: '#FFD700',
  },
  quickZoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickZoomTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  bottomConsole: {
    backgroundColor: '#000000',
    width: '100%',
  },
  frozenLoaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  frozenLoaderBox: {
    backgroundColor: 'rgba(20, 20, 24, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 220,
  },
  frozenLoaderTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  frozenLoaderText: {
    ...typography.caption,
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Offscreen watermarking surface
  offscreenComposite: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 1,
  },
  viewShotCanvas: {
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  watermarkAnchor: {
    position: 'absolute',
    bottom: 36,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
