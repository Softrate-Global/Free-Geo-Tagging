import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import ViewShot from 'react-native-view-shot';

import { useLocation } from '../../location/hooks/useLocation';
import { LocationService } from '../../location/services/locationService';
import { LocationStatus } from '../components/LocationStatus';
import { CameraControls } from '../components/CameraControls';
import { FlashButton } from '../components/FlashButton';
import { WatermarkTemplate } from '../../watermark/components/WatermarkTemplate';
import { PermissionRequestView } from '../../../shared/components/PermissionRequestView';

import { CameraService } from '../services/cameraService';
import { WatermarkService } from '../../watermark/services/watermarkService';
import { GalleryService } from '../../gallery/services/galleryService';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';
import { PermissionService } from '../../permissions/services/permissionService';

import { generatePhotoFilename } from '../../../core/utils/filenameGenerator';
import { PhotoMetadata, GPSStatus, LocationData } from '../../../shared/types/photoTypes';
import { WatermarkData } from '../../watermark/types/watermarkTypes';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import { EditLocationModal } from '../components/EditLocationModal';
import { CustomLocationService } from '../../location/services/customLocationService';

interface PendingCapture {
  watermarkedUri: string;
  captureTimestamp: number;
  width: number;
  height: number;
  location: LocationData | null;
  gpsStatus: GPSStatus;
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

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [isRequestingPerms, setIsRequestingPerms] = useState(false);

  // GPS Sensor Hook
  const { currentLocation, gpsStatus, isAcquiring, refreshLocation } = useLocation();

  // Processing & Compositing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
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

  const effectiveLocation: LocationData | null = currentLocation
    ? {
        ...currentLocation,
        placeName: customOverrideLocation?.placeName ?? currentLocation.placeName,
        subAddress: customOverrideLocation?.subAddress ?? currentLocation.subAddress,
        formattedAddress: customOverrideLocation?.formattedAddress ?? currentLocation.formattedAddress,
      }
    : null;

  const handleSaveCustomLocation = async (data: {
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
  };

  const handleResetCustomLocation = async () => {
    if (currentLocation) {
      await CustomLocationService.clearSavedLocation(
        currentLocation.latitude,
        currentLocation.longitude
      );
    }
    setCustomOverrideLocation(null);
    refreshLocation();
  };

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

    // Load recent photo thumbnail
    async function loadRecentThumbnail() {
      const photos = await LocalMetadataService.getAllPhotos();
      if (photos.length > 0) {
        setLastThumbnailUri(photos[0].processedUri);
      }
    }
    loadRecentThumbnail();
  }, []);

  // Re-check permissions when returning from device Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        requestCameraPermission();
        refreshLocation();
        PermissionService.checkAllPermissions().then((all) => {
          setHasMediaPermission(all.mediaGranted);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshLocation, requestCameraPermission]);

  const handleRequestAllPermissions = async () => {
    try {
      setIsRequestingPerms(true);
      const camRes = await requestCameraPermission();
      const locRes = await PermissionService.requestLocation();
      const mediaOk = await PermissionService.requestMediaLibrary();
      setHasMediaPermission(mediaOk);
      await refreshLocation();

      if (!camRes?.granted || !locRes) {
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

  const handleToggleFacing = () => {
    setFacing((cur) => (cur === 'back' ? 'front' : 'back'));
  };

  const handleToggleFlash = () => {
    setFlash((cur) => (cur === 'off' ? 'on' : cur === 'on' ? 'auto' : 'off'));
  };

  // Complete Photo Capture & Watermark Compositing Pipeline
  const handleCapture = async () => {
    if (isProcessing || !cameraRef.current) return;

    try {
      setIsProcessing(true);
      setProcessingStatus('Capturing photograph...');

      const captureTimestamp = Date.now();

      // Step 1: Capture raw photo from camera hardware
      const rawPhoto = await CameraService.capturePhoto(cameraRef.current);

      // Step 2: Normalize image orientation
      setProcessingStatus('Normalizing orientation...');
      const normalized = await WatermarkService.normalizeImage(rawPhoto.uri);

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

      setProcessingStatus('Compositing GPS watermark...');
      const watermarkData = WatermarkService.prepareWatermarkData(
        finalLocation,
        captureTimestamp
      );

      // Set state to render offscreen compositing canvas
      setCompositeImage({
        uri: normalized.uri,
        width: rawPhoto.width,
        height: rawPhoto.height,
        watermarkData,
      });

      // Allow one render tick for ViewShot to paint
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Step 4: Rasterize the permanent image with embedded watermark
      if (!viewShotRef.current) {
        throw new Error('WATERMARK_RENDERER_ERROR');
      }

      setProcessingStatus('Embedding watermark pixels...');
      const watermarkedUri = await WatermarkService.compositeWatermark(viewShotRef);

      // Open Photo Preview Modal for user to choose Delete or Save to Gallery
      setPendingPhoto({
        watermarkedUri,
        captureTimestamp,
        width: rawPhoto.width,
        height: rawPhoto.height,
        location: finalLocation,
        gpsStatus,
      });

      // Reset offscreen composite
      setCompositeImage(null);
    } catch (err: any) {
      console.error('Capture pipeline error:', err);
      Alert.alert(
        'Capture Failed',
        err.message || 'An error occurred while creating the watermarked photograph.'
      );
      setCompositeImage(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDiscardPendingPhoto = () => {
    setPendingPhoto(null);
  };

  const handleSavePendingPhoto = async () => {
    if (!pendingPhoto || isSavingPending) return;

    try {
      setIsSavingPending(true);
      const filename = generatePhotoFilename(pendingPhoto.captureTimestamp);
      const { assetId, publicUri } = await GalleryService.saveToPublicGallery(
        pendingPhoto.watermarkedUri,
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

  // Permission Guard: Camera and GPS Location are the critical hardware prerequisites for the live viewfinder
  const needsPermission =
    !cameraPermission?.granted ||
    gpsStatus === 'PERMISSION_DENIED';

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
        onCameraReady={() => setIsCameraReady(true)}
      />

      <SafeAreaView style={styles.overlayContainer} edges={['top', 'bottom']}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.appBranding}>FREE GEO TAGGING</Text>
          <FlashButton mode={flash} onToggle={handleToggleFlash} disabled={isProcessing} />
        </View>

        {/* GPS Live Status & Coordinates HUD */}
        <LocationStatus
          status={gpsStatus}
          location={effectiveLocation}
          onRefresh={refreshLocation}
          onEditLocation={() => setIsEditLocationModalVisible(true)}
        />

        {/* Center Loading Indicator during capture processing */}
        {isProcessing && (
          <View style={styles.processingModal}>
            <View style={styles.processingBox}>
              <Text style={styles.processingTitle}>PROCESSING PHOTO</Text>
              <Text style={styles.processingText}>{processingStatus}</Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />

        {/* Bottom Controls Bar */}
        <CameraControls
          onCapture={handleCapture}
          onSwitchCamera={handleToggleFacing}
          onOpenGallery={() => navigation.navigate('Gallery')}
          isProcessing={isProcessing}
          canCapture={isCameraReady && !isProcessing}
          thumbnailUri={lastThumbnailUri}
        />
      </SafeAreaView>

      {/* Off-screen ViewShot Container for Permanent Watermark Baking */}
      {compositeImage && (
        <View style={styles.offscreenComposite} pointerEvents="none">
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 0.92, result: 'tmpfile' }}
            style={[
              styles.viewShotCanvas,
              {
                width: width,
                height: Math.round((width * compositeImage.height) / (compositeImage.width || 1)),
              },
            ]}
          >
            <Image
              source={{ uri: compositeImage.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.watermarkAnchor}>
              <WatermarkTemplate data={compositeImage.watermarkData} scale={1} />
            </View>
          </ViewShot>
        </View>
      )}

      {/* Full Screen Photo Capture Preview with Top Left Delete and Top Right Save to Gallery */}
      <PhotoPreviewModal
        visible={!!pendingPhoto}
        imageUri={pendingPhoto?.watermarkedUri || null}
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
    justifyContent: 'space-between',
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
  spacer: {
    flex: 1,
  },
  processingModal: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  processingBox: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#38383A',
    padding: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 240,
  },
  processingTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  processingText: {
    ...typography.caption,
    color: colors.textSecondary,
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
