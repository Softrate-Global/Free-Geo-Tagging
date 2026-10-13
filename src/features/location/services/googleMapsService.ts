import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

const STORAGE_KEY_GOOGLE_KEY = '@google_maps_api_key';

export interface GoogleLocationResult {
  placeName: string;
  subAddress: string;
  formattedAddress: string;
}

export class GoogleMapsService {
  /**
   * Retrieves the configured Google Maps API key (from local storage or app constants).
   */
  static async getApiKey(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_GOOGLE_KEY);
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {}
    return (APP_CONSTANTS as any).GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Saves a custom Google Maps API key into storage.
   */
  static async setApiKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GOOGLE_KEY, key.trim());
    } catch (err) {
      console.warn('Failed to save Google Maps API key:', err);
    }
  }

  /**
   * Resolves exact company, building, apartment, or business identity using Google Places & Geocoding.
   */
  static async resolveLocation(
    latitude: number,
    longitude: number
  ): Promise<GoogleLocationResult | null> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return null;
    }

    try {
      // 1. Google Places Nearby Search (rankby=distance finds immediate premise/business)
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&key=${apiKey}`;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      const placesPromise = fetch(placesUrl, { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      const geocodePromise = fetch(geocodeUrl, { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      const [placesData, geocodeData] = await Promise.race([
        Promise.all([placesPromise, geocodePromise]),
        new Promise<[null, null]>((resolve) => setTimeout(() => resolve([null, null]), 4500)),
      ]);

      let identifiedPlaceName: string | null = null;

      // Extract nearest place from Google Places Nearby
      if (placesData?.results && placesData.results.length > 0) {
        const top = placesData.results[0];
        if (top?.name && typeof top.name === 'string') {
          identifiedPlaceName = top.name.trim();
        }
      }

      // Extract structured address from Google Geocoding
      const topResult = geocodeData?.results?.[0];
      const addressComponents = topResult?.address_components || [];

      let streetNumber = '';
      let route = '';
      let sublocality = '';
      let locality = '';
      let postalCode = '';
      let country = '';

      for (const comp of addressComponents) {
        const types: string[] = comp.types || [];
        if (types.includes('street_number')) streetNumber = comp.long_name;
        if (types.includes('route')) route = comp.long_name;
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) sublocality = comp.long_name;
        if (types.includes('locality')) locality = comp.long_name;
        if (types.includes('postal_code')) postalCode = comp.long_name;
        if (types.includes('country')) country = comp.long_name;
      }

      const streetLine = [streetNumber, route].filter(Boolean).join(' ');
      const placeName =
        identifiedPlaceName ||
        streetLine ||
        sublocality ||
        locality ||
        'GPS LOCATION';

      const subParts: string[] = [];
      const placeLower = placeName.toLowerCase();

      if (sublocality && !placeLower.includes(sublocality.toLowerCase())) {
        subParts.push(sublocality);
      } else if (locality && !placeLower.includes(locality.toLowerCase())) {
        subParts.push(locality);
      }

      if (country && !placeLower.includes(country.toLowerCase())) {
        subParts.push(country);
      }

      const subAddress = subParts.slice(0, 2).join(', ') || locality || country || '';
      const formattedAddress = topResult?.formatted_address || [placeName, subAddress].filter(Boolean).join(', ');

      return {
        placeName,
        subAddress,
        formattedAddress,
      };
    } catch (err) {
      console.warn('Google Maps resolution notice:', err);
      return null;
    }
  }
}
