import * as Location from 'expo-location';
import { LocationData, GPSStatus } from '../../../shared/types/photoTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

export class LocationService {
  /**
   * Evaluates GPS status based on permission, service availability, and horizontal accuracy.
   */
  static evaluateAccuracy(
    accuracy: number | null,
    targetAccuracy: number = APP_CONSTANTS.TARGET_ACCURACY_METERS
  ): GPSStatus {
    if (accuracy == null) {
      return 'ACQUIRING';
    }
    if (accuracy <= targetAccuracy) {
      return 'ACQUIRED';
    }
    return 'INSUFFICIENT_ACCURACY';
  }

  /**
   * Acquire a fresh, high-accuracy GPS location fix.
   * Enforces timeout and returns structured LocationData.
   */
  static async getCurrentLocation(
    timeoutMs: number = APP_CONSTANTS.LOCATION_TIMEOUT_MS
  ): Promise<LocationData> {
    const isEnabled = await Location.hasServicesEnabledAsync();
    if (!isEnabled) {
      throw new Error('DEVICE_LOCATION_DISABLED');
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }

    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), timeoutMs);
    });

    const result = await Promise.race([locationPromise, timeoutPromise]);

    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy ?? 999,
      altitude: result.coords.altitude,
      heading: result.coords.heading,
      speed: result.coords.speed,
      timestamp: result.timestamp,
    };
  }

  /**
   * Subscribes to GPS location updates for real-time camera preview HUD.
   */
  static async watchLocation(
    onLocation: (loc: LocationData) => void,
    onError: (err: any) => void
  ): Promise<Location.LocationSubscription> {
    const isEnabled = await Location.hasServicesEnabledAsync();
    if (!isEnabled) {
      throw new Error('DEVICE_LOCATION_DISABLED');
    }

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: APP_CONSTANTS.LOCATION_UPDATE_INTERVAL_MS,
        distanceInterval: APP_CONSTANTS.LOCATION_DISTANCE_FILTER_METERS,
      },
      (res) => {
        onLocation({
          latitude: res.coords.latitude,
          longitude: res.coords.longitude,
          accuracy: res.coords.accuracy ?? 999,
          altitude: res.coords.altitude,
          heading: res.coords.heading,
          speed: res.coords.speed,
          timestamp: res.timestamp,
        });
      }
    );
  }
}
