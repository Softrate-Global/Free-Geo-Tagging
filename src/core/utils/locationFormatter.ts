import { GPSStatus } from '../../shared/types/photoTypes';

/**
 * Formats latitude with hemisphere letter (e.g. "11.664321° N")
 */
export function formatLatitude(lat: number, decimals: number = 6): string {
  const hemisphere = lat >= 0 ? 'N' : 'S';
  const absLat = Math.abs(lat).toFixed(decimals);
  return `${absLat}° ${hemisphere}`;
}

/**
 * Formats longitude with hemisphere letter (e.g. "78.146012° E")
 */
export function formatLongitude(lon: number, decimals: number = 6): string {
  const hemisphere = lon >= 0 ? 'E' : 'W';
  const absLon = Math.abs(lon).toFixed(decimals);
  return `${absLon}° ${hemisphere}`;
}

/**
 * Formats horizontal accuracy in meters (e.g. "±8 m")
 */
export function formatAccuracy(accuracy: number | null | undefined): string {
  if (accuracy == null || isNaN(accuracy)) {
    return '±-- m';
  }
  return `±${Math.round(accuracy)} m`;
}

/**
 * Formats altitude in meters
 */
export function formatAltitude(altitude: number | null | undefined): string {
  if (altitude == null || isNaN(altitude)) {
    return '-- m';
  }
  return `${Math.round(altitude)} m`;
}

/**
 * Returns human-readable label for GPS status
 */
export function getGPSStatusLabel(status: GPSStatus, accuracy?: number | null): string {
  switch (status) {
    case 'ACQUIRING':
      return 'Acquiring GPS location...';
    case 'ACQUIRED':
      return accuracy != null ? `GPS: ${formatAccuracy(accuracy)}` : 'Location acquired';
    case 'INSUFFICIENT_ACCURACY':
      return accuracy != null ? `Low Accuracy (${formatAccuracy(accuracy)})` : 'Accuracy insufficient';
    case 'UNAVAILABLE':
      return 'Location unavailable';
    case 'PERMISSION_DENIED':
      return 'Location permission denied';
    case 'SERVICES_DISABLED':
      return 'Device location disabled';
    default:
      return 'GPS Offline';
  }
}
