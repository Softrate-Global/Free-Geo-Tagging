import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_CUSTOM_LOCATIONS = '@custom_saved_geotags_v1';

export interface SavedLocationEntry {
  id: string;
  latitude: number;
  longitude: number;
  placeName: string;
  subAddress: string;
  formattedAddress: string;
  savedAt: number;
}

/**
 * Built-in known facility presets (fallback when user hasn't explicitly set a custom tag yet).
 */
const DEFAULT_PRESET_LOCATIONS: SavedLocationEntry[] = [
  {
    id: 'preset_softrate_hq',
    latitude: 13.028948,
    longitude: 80.108001,
    placeName: 'SOFTRATE TECH PARK',
    subAddress: 'Mangadu, Chennai',
    formattedAddress: '60A, Velleeswarar Koil Street, Srinivasa Nagar, Mangadu, Chennai - 600122',
    savedAt: 0,
  },
];

/**
 * Calculates distance in meters between two lat/lon coordinates using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class CustomLocationService {
  /**
   * Loads all user-defined custom geotag locations from persistent storage.
   */
  static async getAllSavedLocations(): Promise<SavedLocationEntry[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_LOCATIONS);
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to load saved custom locations:', err);
      return [];
    }
  }

  /**
   * Finds any saved custom location or known facility within a specified radius (default: 150 meters).
   * Perfect for detecting when the user is at their office, tech park, apartment, or home.
   */
  static async getSavedLocation(
    latitude: number,
    longitude: number,
    maxDistanceMeters: number = 150
  ): Promise<SavedLocationEntry | null> {
    try {
      // 1. Check user-defined overrides in storage first
      const all = await this.getAllSavedLocations();
      let closest: SavedLocationEntry | null = null;
      let minDistance = maxDistanceMeters;

      for (const loc of all) {
        const dist = calculateDistanceMeters(latitude, longitude, loc.latitude, loc.longitude);
        if (dist <= minDistance) {
          minDistance = dist;
          closest = loc;
        }
      }

      if (closest) {
        return closest;
      }

      // 2. Fallback to known facility presets
      for (const preset of DEFAULT_PRESET_LOCATIONS) {
        const dist = calculateDistanceMeters(latitude, longitude, preset.latitude, preset.longitude);
        if (dist <= minDistance) {
          minDistance = dist;
          closest = preset;
        }
      }

      return closest;
    } catch {
      return null;
    }
  }

  /**
   * Saves or updates a custom company/apartment/house name and address for the given coordinates.
   */
  static async saveLocation(
    latitude: number,
    longitude: number,
    data: {
      placeName: string;
      subAddress?: string;
      formattedAddress?: string;
    }
  ): Promise<SavedLocationEntry> {
    const all = await this.getAllSavedLocations();

    // Remove any previous entry within 60 meters to prevent duplicate clutter
    const filtered = all.filter(
      (loc) => calculateDistanceMeters(latitude, longitude, loc.latitude, loc.longitude) > 60
    );

    const newEntry: SavedLocationEntry = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      latitude,
      longitude,
      placeName: data.placeName.trim(),
      subAddress: (data.subAddress || '').trim(),
      formattedAddress: (data.formattedAddress || '').trim(),
      savedAt: Date.now(),
    };

    filtered.unshift(newEntry);

    // Keep up to 100 saved locations
    const capped = filtered.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_LOCATIONS, JSON.stringify(capped));

    return newEntry;
  }

  /**
   * Clears any saved custom location within radius of coordinates.
   */
  static async clearSavedLocation(
    latitude: number,
    longitude: number,
    radiusMeters: number = 100
  ): Promise<void> {
    const all = await this.getAllSavedLocations();
    const filtered = all.filter(
      (loc) => calculateDistanceMeters(latitude, longitude, loc.latitude, loc.longitude) > radiusMeters
    );
    await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_LOCATIONS, JSON.stringify(filtered));
  }
}
