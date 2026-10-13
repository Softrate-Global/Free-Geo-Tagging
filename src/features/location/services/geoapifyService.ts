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
   * Queries Geoapify Places and Reverse Geocoding APIs with strict proximity filtering
   * to accurately extract house/building name, street address, and administrative hierarchy.
   *
   * Crucial rule: Distant amenities/landmarks (> 40m) are strictly REJECTED to prevent
   * displaying unrelated temples, parks, or shops when the user is inside a company or home.
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
      // Step 1: Query Places API within immediate proximity (50m) for commercial/office/tech park POIs
      const placesUrl = `https://api.geoapify.com/v2/places?categories=commercial,office,education,entertainment,catering,building,production&filter=circle:${longitude},${latitude},50&bias=proximity:${longitude},${latitude}&limit=3&apiKey=${apiKey}`;

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

      let verifiedBuildingName: string | null = null;

      // Extract POI from Places API ONLY if strictly within 40 meters
      if (placesData?.features && placesData.features.length > 0) {
        for (const feat of placesData.features) {
          const name = feat?.properties?.name;
          const distance = feat?.properties?.distance ?? 0;
          if (name && typeof name === 'string' && name.trim().length > 0 && distance <= 40) {
            // Avoid generic house numbers
            if (!/^\d+[\w\s\-\/]*$/.test(name.trim())) {
              verifiedBuildingName = name.trim();
              break;
            }
          }
        }
      }

      // Extract reverse geocode properties
      const revProps = reverseData?.features?.[0]?.properties;
      const revDistance = revProps?.distance ?? 0;
      const resultType = revProps?.result_type;

      // Check if reverse geocode returned a building/amenity name
      if (!verifiedBuildingName && revProps?.name) {
        const rawName = revProps.name.trim();
        // If it's an amenity or place, ONLY accept if user is actually right at it (<= 35m)
        if (revDistance <= 35 || resultType === 'building') {
          if (!/^\d+[\w\s\-\/]*$/.test(rawName)) {
            verifiedBuildingName = rawName;
          }
        }
      }

      // Extract accurate street and address components
      const houseNumber = revProps?.housenumber || '';
      const streetName = revProps?.street || '';
      const suburb = revProps?.suburb || revProps?.district || '';
      const city = revProps?.city || revProps?.county || '';
      const state = revProps?.state || '';
      const postcode = revProps?.postcode || '';
      const country = revProps?.country || 'India';

      // Build street address line
      const streetAddress = [houseNumber, streetName].filter(Boolean).join(', ') || streetName;

      // Primary Place Name:
      // 1. Verified building/company name (< 40m)
      // 2. Street address (e.g. "60A Velleeswarar Koil St" or "Melma Nagar Main Road")
      // 3. Suburb / Neighborhood
      // 4. City
      const placeName =
        verifiedBuildingName ||
        streetAddress ||
        suburb ||
        city ||
        'GPS LOCATION';

      // Build concise sub-address (e.g. "Mangadu, Chennai" or "Poonamallee, India")
      const subParts: string[] = [];
      const placeLower = placeName.toLowerCase();

      if (suburb && !placeLower.includes(suburb.toLowerCase())) {
        subParts.push(suburb);
      }
      if (city && !placeLower.includes(city.toLowerCase())) {
        subParts.push(city);
      }
      if (country && !placeLower.includes(country.toLowerCase()) && subParts.length < 2) {
        subParts.push(country);
      }

      const subAddress = subParts.slice(0, 2).join(', ') || city || country || '';

      // Build full, clean structured address without distant landmark names
      const addressParts: string[] = [];
      if (verifiedBuildingName) {
        addressParts.push(verifiedBuildingName);
      }
      if (streetAddress && !addressParts.includes(streetAddress)) {
        addressParts.push(streetAddress);
      }
      if (suburb && !addressParts.includes(suburb)) {
        addressParts.push(suburb);
      }
      if (city && !addressParts.includes(city)) {
        if (postcode) {
          addressParts.push(`${city} - ${postcode}`);
        } else {
          addressParts.push(city);
        }
      }
      if (state && !addressParts.includes(state)) {
        addressParts.push(state);
      }
      if (country && !addressParts.includes(country)) {
        addressParts.push(country);
      }

      const formattedAddress =
        addressParts.length > 0
          ? addressParts.join(', ')
          : revProps?.formatted || [placeName, subAddress].filter(Boolean).join(', ');

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
