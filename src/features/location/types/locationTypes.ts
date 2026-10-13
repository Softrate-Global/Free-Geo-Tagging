import { GPSStatus, LocationData } from '../../../shared/types/photoTypes';

export interface LocationState {
  status: GPSStatus;
  currentLocation: LocationData | null;
  accuracy: number | null;
  isAcquiring: boolean;
  errorMessage: string | null;
}

export interface LocationOptions {
  targetAccuracyMeters?: number;
  timeoutMs?: number;
}
