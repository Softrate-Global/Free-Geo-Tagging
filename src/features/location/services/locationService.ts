import * as Location from 'expo-location';
import { LocationData, GPSStatus } from '../../../shared/types/photoTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';
import { GeoapifyService } from './geoapifyService';

import { CustomLocationService } from './customLocationService';
import { GoogleMapsService } from './googleMapsService';

export class LocationService {
  /**
   * Evaluates GPS status based on permission, service availability, and horizontal accuracy.
   * Includes hysteresis support: once ACQUIRED, allows up to 38m before downgrading to avoid flickering.
   */
  static evaluateAccuracy(
    accuracy: number | null,
    targetAccuracy: number = APP_CONSTANTS.TARGET_ACCURACY_METERS,
    currentStatus?: GPSStatus
  ): GPSStatus {
    if (accuracy == null) {
      return 'ACQUIRING';
    }
    // Hysteresis guard: prevent green/orange fluttering when accuracy drifts near threshold
    if (currentStatus === 'ACQUIRED') {
      if (accuracy <= 38) {
        return 'ACQUIRED';
      }
      return 'INSUFFICIENT_ACCURACY';
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

  private static geoCache: {
    lat: number;
    lng: number;
    data: { placeName: string; subAddress: string; formattedAddress: string };
    timestamp: number;
  }[] = [];

  private static cacheAndReturn(
    lat: number,
    lng: number,
    data: { placeName: string; subAddress: string; formattedAddress: string }
  ) {
    this.geoCache.unshift({
      lat,
      lng,
      data,
      timestamp: Date.now(),
    });
    if (this.geoCache.length > 25) this.geoCache.pop();
    return data;
  }

  /**
   * Reverse-geocodes coordinates into a readable place name and address.
   * Multi-tier resolution:
   * 1. In-memory proximity cache (< 20m, 10 min TTL)
   * 2. User-customized / remembered location memory (< 120m)
   * 3. Native OS Geocoder (instant, offline-capable via Play Services)
   * 4. Google Places & Geocoding API (if key available)
   * 5. Geoapify Places & Reverse Geocoding (with strict <= 40m distance guard)
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ placeName: string; subAddress: string; formattedAddress: string } | null> {
    // 0. Proximity Cache lookup
    const now = Date.now();
    const cached = this.geoCache.find(
      (c) =>
        now - c.timestamp < 600000 &&
        Math.abs(c.lat - latitude) < 0.0002 &&
        Math.abs(c.lng - longitude) < 0.0002
    );
    if (cached) {
      return cached.data;
    }

    // 1. Check user-defined / remembered location memory
    try {
      const saved = await CustomLocationService.getSavedLocation(latitude, longitude);
      if (saved && saved.placeName) {
        return this.cacheAndReturn(latitude, longitude, {
          placeName: saved.placeName,
          subAddress: saved.subAddress,
          formattedAddress: saved.formattedAddress,
        });
      }
    } catch {}

    // 2. Attempt Native Android / OS Geocoder (backed by Google Play Services on Android)
    let nativeResult: {
      placeName: string;
      subAddress: string;
      formattedAddress: string;
      hasStreet: boolean;
    } | null = null;

    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const street = addr.street || '';
        const streetNumber = addr.streetNumber || '';
        const streetFull = [streetNumber, street].filter(Boolean).join(' ') || street;
        const district = addr.district || addr.subregion || '';
        const city = addr.city || '';
        const state = addr.region || '';
        const postalCode = addr.postalCode || '';
        const country = addr.country || 'India';

        const placeName =
          addr.name && !/^\d+[\w\s\-\/]*$/.test(addr.name.trim()) && addr.name !== street
            ? addr.name
            : streetFull || district || city || 'GPS LOCATION';

        const subParts: string[] = [];
        const placeLower = placeName.toLowerCase();

        if (district && !placeLower.includes(district.toLowerCase())) subParts.push(district);
        if (city && !placeLower.includes(city.toLowerCase())) subParts.push(city);
        if (country && !placeLower.includes(country.toLowerCase()) && subParts.length < 2) subParts.push(country);
        const subAddress = subParts.slice(0, 2).join(', ') || city || country || '';

        const parts: string[] = [];
        if (addr.name && !/^\d+[\w\s\-\/]*$/.test(addr.name.trim()) && addr.name !== street) {
          parts.push(addr.name);
        }
        if (streetFull && !parts.includes(streetFull)) parts.push(streetFull);
        if (district && !parts.includes(district)) parts.push(district);
        if (city && !parts.includes(city)) {
          if (postalCode) parts.push(`${city} - ${postalCode}`);
          else parts.push(city);
        }
        if (state && !parts.includes(state)) parts.push(state);
        if (country && !parts.includes(country)) parts.push(country);

        const formattedAddress = parts.join(', ');

        nativeResult = {
          placeName,
          subAddress,
          formattedAddress,
          hasStreet: Boolean(streetFull),
        };
      }
    } catch (err) {
      console.warn('Native geocoding notice:', err);
    }

    // If native geocoder provided a street-level address, cache and return immediately!
    if (nativeResult && nativeResult.hasStreet) {
      return this.cacheAndReturn(latitude, longitude, {
        placeName: nativeResult.placeName,
        subAddress: nativeResult.subAddress,
        formattedAddress: nativeResult.formattedAddress,
      });
    }

    // 3. Attempt Google Places & Geocoding (if API key configured)
    try {
      const googleResult = await GoogleMapsService.resolveLocation(latitude, longitude);
      if (googleResult && googleResult.placeName) {
        return this.cacheAndReturn(latitude, longitude, googleResult);
      }
    } catch {}

    // 4. Attempt Geoapify POI & Places resolution with strict distance filter
    try {
      const geoapifyResult = await GeoapifyService.resolveLocation(latitude, longitude);
      if (geoapifyResult && geoapifyResult.placeName) {
        return this.cacheAndReturn(latitude, longitude, geoapifyResult);
      }
    } catch {}

    // Fallback to native result if Geoapify didn't resolve
    if (nativeResult) {
      return this.cacheAndReturn(latitude, longitude, {
        placeName: nativeResult.placeName,
        subAddress: nativeResult.subAddress,
        formattedAddress: nativeResult.formattedAddress,
      });
    }

    return null;
  }
}

