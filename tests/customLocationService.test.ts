const storage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => storage[key] || null),
  setItem: jest.fn(async (key: string, val: string) => {
    storage[key] = val;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  }),
}));

import {
  CustomLocationService,
  calculateDistanceMeters,
} from '../src/features/location/services/customLocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('CustomLocationService & Distance Calculations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('calculates Haversine distance correctly', () => {
    // Distance between Softrate Tech Park coords and a point ~135m away
    const lat1 = 13.028948;
    const lon1 = 80.108001;
    const lat2 = 13.0290291;
    const lon2 = 80.1067583;

    const distance = calculateDistanceMeters(lat1, lon1, lat2, lon2);
    expect(Math.round(distance)).toBeGreaterThan(120);
    expect(Math.round(distance)).toBeLessThan(150);
  });

  it('saves and retrieves custom location by proximity', async () => {
    const lat = 13.028948;
    const lon = 80.108001;

    await CustomLocationService.saveLocation(lat, lon, {
      placeName: 'SOFTRATE TECH PARK',
      subAddress: 'Mangadu, Chennai',
      formattedAddress: '60A, Velleeswarar Koil St, Srinivasa Nagar, Mangadu, Chennai 600122',
    });

    // Query with coordinates 20 meters away
    const matched = await CustomLocationService.getSavedLocation(13.02896, 80.10802);
    expect(matched).not.toBeNull();
    expect(matched?.placeName).toBe('SOFTRATE TECH PARK');
    expect(matched?.formattedAddress).toContain('60A, Velleeswarar Koil St');
  });

  it('returns null if outside proximity threshold', async () => {
    const lat = 13.028948;
    const lon = 80.108001;

    await CustomLocationService.saveLocation(lat, lon, {
      placeName: 'SOFTRATE TECH PARK',
      subAddress: 'Mangadu, Chennai',
      formattedAddress: '60A, Velleeswarar Koil St, Srinivasa Nagar, Mangadu, Chennai 600122',
    });

    // Query 500 meters away
    const matched = await CustomLocationService.getSavedLocation(13.033, 80.112, 100);
    expect(matched).toBeNull();
  });

  it('clears saved custom location within radius', async () => {
    const lat = 13.028948;
    const lon = 80.108001;

    await CustomLocationService.saveLocation(lat, lon, {
      placeName: 'SOFTRATE TECH PARK',
    });

    await CustomLocationService.clearSavedLocation(lat, lon);

    const matched = await CustomLocationService.getSavedLocation(lat, lon);
    expect(matched).toBeNull();
  });
});
