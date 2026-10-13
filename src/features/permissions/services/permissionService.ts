import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
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
      MediaLibrary.getPermissionsAsync().catch(() => ({ granted: false })),
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
      const res = await MediaLibrary.requestPermissionsAsync(true); // write-only / granular access
      return res.granted;
    } catch {
      return false;
    }
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
}
