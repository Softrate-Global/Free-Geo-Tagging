jest.mock('expo-location', () => ({
  Accuracy: { BestForNavigation: 6, High: 5 },
  hasServicesEnabledAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

import {
  formatLatitude,
  formatLongitude,
  formatAccuracy,
  formatAltitude,
  getGPSStatusLabel,
} from '../src/core/utils/locationFormatter';
import { LocationService } from '../src/features/location/services/locationService';

describe('Location Formatter and Accuracy Validation', () => {
  test('formats positive latitude as North', () => {
    expect(formatLatitude(11.664321, 6)).toBe('11.664321° N');
  });

  test('formats negative latitude as South', () => {
    expect(formatLatitude(-33.86882, 5)).toBe('33.86882° S');
  });

  test('formats positive longitude as East', () => {
    expect(formatLongitude(78.146012, 6)).toBe('78.146012° E');
  });

  test('formats negative longitude as West', () => {
    expect(formatLongitude(-122.084, 3)).toBe('122.084° W');
  });

  test('formats horizontal accuracy with ± symbol and meters', () => {
    expect(formatAccuracy(8.2)).toBe('±8 m');
    expect(formatAccuracy(null)).toBe('±-- m');
    expect(formatAccuracy(undefined)).toBe('±-- m');
  });

  test('formats altitude with meters', () => {
    expect(formatAltitude(342.6)).toBe('343 m');
    expect(formatAltitude(null)).toBe('-- m');
  });

  test('evaluates GPS accuracy threshold correctly', () => {
    // Under 20m target is ACQUIRED
    expect(LocationService.evaluateAccuracy(8, 20)).toBe('ACQUIRED');
    expect(LocationService.evaluateAccuracy(20, 20)).toBe('ACQUIRED');
    // Over 20m target is INSUFFICIENT_ACCURACY
    expect(LocationService.evaluateAccuracy(25, 20)).toBe('INSUFFICIENT_ACCURACY');
    // Null accuracy is ACQUIRING
    expect(LocationService.evaluateAccuracy(null, 20)).toBe('ACQUIRING');
  });

  test('returns honest status labels', () => {
    expect(getGPSStatusLabel('ACQUIRING')).toBe('Acquiring GPS location...');
    expect(getGPSStatusLabel('ACQUIRED', 8)).toBe('GPS: ±8 m');
    expect(getGPSStatusLabel('INSUFFICIENT_ACCURACY', 45)).toBe('Low Accuracy (±45 m)');
    expect(getGPSStatusLabel('SERVICES_DISABLED')).toBe('Device location disabled');
    expect(getGPSStatusLabel('PERMISSION_DENIED')).toBe('Location permission denied');
  });
});
