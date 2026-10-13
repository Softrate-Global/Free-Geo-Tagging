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
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { WatermarkData } from '../../watermark/types/watermarkTypes';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

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
      let finalLocation = currentLocation;
      if (finalLocation && !finalLocation.placeName) {
        try {
          const geo = await LocationService.reverseGeocode(
            finalLocation.latitude,
            finalLocation.longitude
          );
          if (geo) {
            finalLocation = {
              ...finalLocation,
              placeName: geo.placeName,
              formattedAddress: geo.formattedAddress,
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

      // Step 5: Save processed image to permanent storage and public Free Geo Tagging album
      setProcessingStatus('Saving to Free Geo Tagging album...');
      const filename = generatePhotoFilename(captureTimestamp);
      const { assetId, publicUri } = await GalleryService.saveToPublicGallery(
        watermarkedUri,
        filename
      );

      // Step 6: Persist photo metadata offline with resolved place and address
      const photoMetadata: PhotoMetadata = {
        id: `photo_${captureTimestamp}`,
        filename,
        mediaAssetId: assetId,
        processedUri: publicUri,
        width: rawPhoto.width,
        height: rawPhoto.height,
        location: finalLocation,
        locationStatus: gpsStatus,
        capturedAt: captureTimestamp,
        processedAt: Date.now(),
        watermarkApplied: true,
      };

      await LocalMetadataService.savePhoto(photoMetadata);
      setLastThumbnailUri(publicUri);

      // Reset offscreen composite
      setCompositeImage(null);
    } catch (err: any) {
      console.error('Capture pipeline error:', err);
      Alert.alert(
        'Capture Failed',
        err.message || 'An error occurred while saving the watermarked photograph.'
      );
      setCompositeImage(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
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
          location={currentLocation}
          onRefresh={refreshLocation}
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
    bottom: 24,
    left: 20,
  },
});
