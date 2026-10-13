/**
 * Generates a unique, timestamped filename matching the format:
 * GPS_YYYYMMDD_HHMMSS.jpg
 */
export function generatePhotoFilename(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const millis = String(d.getMilliseconds()).padStart(3, '0');

  return `GPS_${year}${month}${day}_${hours}${minutes}${seconds}_${millis}.jpg`;
}
