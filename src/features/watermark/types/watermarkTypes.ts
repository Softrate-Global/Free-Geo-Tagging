import { LocationData } from '../../../shared/types/photoTypes';

export interface WatermarkData {
  appName: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  captureTimestamp: number;
}

export interface WatermarkOptions {
  position?: 'bottom-left' | 'bottom-right';
  showAltitude?: boolean;
}
