import { APP_CONSTANTS } from '../../../core/constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_GEOAPIFY_KEY = '@geoapify_api_key';

export interface GeoapifyResult {
  placeName: string;
  subAddress: string;
  formattedAddress: string;
}

export class GeoapifyService {
  /**
   * Retrieves the configured Geoapify API key (from local storage or app constants).
   */
  static async getApiKey(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_GEOAPIFY_KEY);
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {}
    return (APP_CONSTANTS as any).GEOAPIFY_API_KEY || '';
  }

  /**
   * Saves a custom Geoapify API key into storage.
   */
  static async setApiKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GEOAPIFY_KEY, key.trim());
    } catch (err) {
      console.warn('Failed to save Geoapify API key:', err);
    }
  }

  /**
   * Queries Geoapify Places and Reverse Geocoding APIs to resolve
   * exact business, building, or landmark identity (e.g. "SOFTRATE TECH PARK").
   */
  static async resolveLocation(
    latitude: number,
    longitude: number
  ): Promise<GeoapifyResult | null> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return null;
    }

    try {
      // Step 1: Query Places API for nearby commercial/office/tech park Points of Interest (within 150m)
      const placesUrl = `https://api.geoapify.com/v2/places?categories=commercial,office,education,entertainment,catering,building,production&filter=circle:${longitude},${latitude},150&bias=proximity:${longitude},${latitude}&limit=3&apiKey=${apiKey}`;

      const placesPromise = fetch(placesUrl, {
        headers: { Accept: 'application/json' },
      }).then((res) => (res.ok ? res.json() : null)).catch(() => null);

      // Step 2: Query Reverse Geocoding for structured administrative hierarchy
      const reverseUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;

      const reversePromise = fetch(reverseUrl, {
        headers: { Accept: 'application/json' },
      }).then((res) => (res.ok ? res.json() : null)).catch(() => null);

      // Timeout guard of 4.5 seconds to prevent slowing down the camera
      const [placesData, reverseData] = await Promise.race([
        Promise.all([placesPromise, reversePromise]),
        new Promise<[null, null]>((resolve) => setTimeout(() => resolve([null, null]), 4500)),
      ]);

      let identifiedPlaceName: string | null = null;

      // Extract POI from Places API
      if (placesData?.features && placesData.features.length > 0) {
        for (const feat of placesData.features) {
          const name = feat?.properties?.name;
          if (name && typeof name === 'string' && name.trim().length > 0) {
            // Avoid generic house numbers
            if (!/^\d+[\w\s\-\/]*$/.test(name.trim())) {
              identifiedPlaceName = name.trim();
              break;
            }
          }
        }
      }

      // Extract reverse geocode properties
      const revProps = reverseData?.features?.[0]?.properties;

      // Fallback place name if not found in Places API
      const placeName =
        identifiedPlaceName ||
        revProps?.name ||
        revProps?.street ||
        revProps?.suburb ||
        revProps?.district ||
        revProps?.city ||
        'GPS LOCATION';

      // Build concise sub-address (e.g. "Poonamallee, India")
      const subParts: string[] = [];
      const placeLower = placeName.toLowerCase();

      const district = revProps?.suburb || revProps?.district;
      const city = revProps?.city;
      const country = revProps?.country || revProps?.state;

      if (district && !placeLower.includes(district.toLowerCase())) {
        subParts.push(district);
      } else if (city && !placeLower.includes(city.toLowerCase())) {
        subParts.push(city);
      }

      if (country && !placeLower.includes(country.toLowerCase())) {
        subParts.push(country);
      }

      const subAddress = subParts.slice(0, 2).join(', ') || city || country || '';
      const formattedAddress = revProps?.formatted || [placeName, subAddress].filter(Boolean).join(', ');

      return {
        placeName,
        subAddress,
        formattedAddress,
      };
    } catch (err) {
      console.warn('Geoapify resolution notice (will fallback to native Geocoder):', err);
      return null;
    }
  }
}
