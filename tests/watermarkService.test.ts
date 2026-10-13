jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

import { WatermarkService } from '../src/features/watermark/services/watermarkService';
import { LocationData } from '../src/shared/types/photoTypes';

describe('Watermark Data Preparation', () => {
  test('prepares complete watermark data with coordinates and altitude', () => {
    const mockLocation: LocationData = {
      latitude: 11.664321,
      longitude: 78.146012,
      accuracy: 8.5,
      altitude: 340,
      heading: 0,
      speed: 0,
      timestamp: 1760336520000,
    };
    const captureTimestamp = 1760336520000;

    const data = WatermarkService.prepareWatermarkData(mockLocation, captureTimestamp);

    expect(data.appName).toBe('FREE GEO TAGGING');
    expect(data.latitude).toBe(11.664321);
    expect(data.longitude).toBe(78.146012);
    expect(data.accuracy).toBe(8.5);
    expect(data.altitude).toBe(340);
    expect(data.captureTimestamp).toBe(captureTimestamp);
  });

  test('prepares fallback watermark data when GPS is offline or unavailable', () => {
    const captureTimestamp = 1760336520000;
    const data = WatermarkService.prepareWatermarkData(null, captureTimestamp);

    expect(data.appName).toBe('FREE GEO TAGGING');
    expect(data.latitude).toBeNull();
    expect(data.longitude).toBeNull();
    expect(data.accuracy).toBeNull();
    expect(data.altitude).toBeNull();
    expect(data.captureTimestamp).toBe(captureTimestamp);
  });
});
