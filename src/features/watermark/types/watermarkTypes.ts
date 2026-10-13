import { LocationData } from '../../../shared/types/photoTypes';

export interface WatermarkData {
  appName: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  placeName?: string | null;
  subAddress?: string | null;
  formattedAddress?: string | null;
  captureTimestamp: number;
}

export interface WatermarkOptions {
  position?: 'bottom-left' | 'bottom-right';
  showAltitude?: boolean;
}
