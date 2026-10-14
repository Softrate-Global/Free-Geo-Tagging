import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Camera } from 'expo-camera';

export interface AppPermissionStatus {
  cameraGranted: boolean;
  locationGranted: boolean;
  mediaGranted: boolean;
  locationServicesEnabled: boolean;
}

export class PermissionService {
  /**
   * Check all relevant permissions status
   */
  static async checkAllPermissions(): Promise<AppPermissionStatus> {
    const [cameraStatus, locationStatus, mediaStatus, locationServices] = await Promise.all([
      Camera.getCameraPermissionsAsync().catch(() => ({ granted: false })),
      Location.getForegroundPermissionsAsync().catch(() => ({ granted: false })),
      MediaLibrary.getPermissionsAsync(false, ['photo']).catch(() => ({ granted: false })),
      Location.hasServicesEnabledAsync().catch(() => false),
    ]);

    return {
      cameraGranted: !!cameraStatus.granted,
      locationGranted: !!locationStatus.granted,
      mediaGranted: !!mediaStatus.granted,
      locationServicesEnabled: locationServices,
    };
  }

  /**
   * Request Camera permission
   */
  static async requestCamera(): Promise<boolean> {
    try {
      const res = await Camera.requestCameraPermissionsAsync();
      return res.granted;
    } catch {
      return false;
    }
  }

  /**
   * Request Foreground Location permission
   */
  static async requestLocation(): Promise<boolean> {
    try {
      const res = await Location.requestForegroundPermissionsAsync();
      return res.granted;
    } catch {
      return false;
    }
  }

  /**
   * Request Media Library permission
   */
  static async requestMediaLibrary(): Promise<boolean> {
    try {
      const res = await MediaLibrary.requestPermissionsAsync();
      return res.granted;
    } catch {
      return false;
    }
  }

  /**
   * Sequentially requests Camera, Location, and Storage permissions one by one,
   * allowing the OS window focus to settle between system dialogs.
   */
  static async requestPermissionsSequentially(
    onStepChange?: (step: 'camera' | 'location' | 'storage') => void
  ): Promise<AppPermissionStatus> {
    // 1. Camera permission
    onStepChange?.('camera');
    await this.requestCamera();
    await new Promise((resolve) => setTimeout(resolve, 450));

    // 2. Foreground Location permission
    onStepChange?.('location');
    await this.requestLocation();
    await new Promise((resolve) => setTimeout(resolve, 450));

    // 3. Storage / Media Library permission for saving photos
    onStepChange?.('storage');
    await this.requestMediaLibrary();
    await new Promise((resolve) => setTimeout(resolve, 450));

    return await this.checkAllPermissions();
  }

  /**
   * Check if hardware GPS / location services are switched on
   */
  static async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Open Android / OS App Settings for manual permission grant
   */
  static openSettings(): void {
    Linking.openSettings().catch(() => {});
  }

  /**
   * Open Device Location Settings (Android GPS toggle) or App Settings (iOS/Permissions)
   */
  static async openLocationSettings(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Try prompting Google Play Services native system prompt first
        await Location.enableNetworkProviderAsync();
        return;
      } catch {
        // If rejected, cancelled, or unavailable, proceed to open system location settings
      }

      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      } catch {
        // Fallback to app settings
        Linking.openSettings().catch(() => {});
      }
    } else {
      Linking.openSettings().catch(() => {});
    }
  }
}
