export type GPSStatus =
  | 'ACQUIRING'
  | 'ACQUIRED'
  | 'INSUFFICIENT_ACCURACY'
  | 'UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number; // ms
}

export interface PhotoMetadata {
  id: string; // Unique UUID
  filename: string; // e.g. GPS_20261013_114200.jpg
  mediaAssetId?: string; // MediaLibrary Asset ID
  originalUri?: string;
  processedUri: string; // Local / gallery uri
  width: number;
  height: number;
  fileSizeBytes?: number;
  
  // Location
  location: LocationData | null;
  locationStatus: GPSStatus;
  
  // Timestamps
  capturedAt: number; // ms timestamp
  processedAt: number; // ms timestamp
  
  watermarkApplied: boolean;
}
