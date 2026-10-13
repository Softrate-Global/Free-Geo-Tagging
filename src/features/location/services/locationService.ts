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

  /**
   * Reverse-geocodes coordinates into a readable place name and address
   * matching Google Maps placemark data.
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ placeName: string; subAddress: string; formattedAddress: string } | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!addresses || addresses.length === 0) return null;

      const addr = addresses[0];

      // 1. Formulate prominent place name
      // If addr.name is purely digits/house number (e.g. "45") or empty, fallback to street or area
      let placeName = addr.name;
      if (!placeName || /^\d+[\w\s\-\/]*$/.test(placeName.trim())) {
        placeName = addr.street || addr.district || addr.subregion || addr.city || 'GPS LOCATION';
      }

      // 2. Formulate concise sub-address (e.g. "Poonamallee, India" or "Mangadu, India")
      const subParts: string[] = [];
      const placeLower = placeName.toLowerCase();

      if (addr.district && !placeLower.includes(addr.district.toLowerCase())) {
        subParts.push(addr.district);
      } else if (addr.city && !placeLower.includes(addr.city.toLowerCase())) {
        subParts.push(addr.city);
      } else if (addr.subregion && !placeLower.includes(addr.subregion.toLowerCase())) {
        subParts.push(addr.subregion);
      }

      if (addr.country) {
        subParts.push(addr.country);
      } else if (addr.region) {
        subParts.push(addr.region);
      }

      const subAddress = subParts.slice(0, 2).join(', ') || addr.city || addr.country || '';

      // 3. Assemble full structured geographical address
      const parts: string[] = [];

      if (addr.street && addr.street !== addr.name) {
        const streetFull = addr.streetNumber ? `${addr.streetNumber} ${addr.street}` : addr.street;
        parts.push(streetFull);
      } else if (addr.name && !parts.includes(addr.name)) {
        parts.push(addr.name);
      }

      if (addr.district && !parts.includes(addr.district)) {
        parts.push(addr.district);
      }
      if (addr.city && !parts.includes(addr.city)) {
        parts.push(addr.city);
      }
      if (addr.region && !parts.includes(addr.region)) {
        parts.push(addr.region);
      }
      if (addr.postalCode && !parts.includes(addr.postalCode)) {
        parts.push(addr.postalCode);
      }
      if (addr.country && !parts.includes(addr.country)) {
        parts.push(addr.country);
      }

      const formattedAddress = parts.join(', ');

      return {
        placeName,
        subAddress,
        formattedAddress,
      };
    } catch (err) {
      console.warn('Reverse geocoding notice:', err);
      return null;
    }
  }
}
