const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats timestamp to "DD MMM YYYY" (e.g. "13 Oct 2026")
 */
export function formatCaptureDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formats timestamp to "hh:mm:ss AM/PM" (e.g. "11:42:05 AM")
 */
export function formatCaptureTime(timestamp: number): string {
  const d = new Date(timestamp);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Formats timestamp to full readable string
 */
export function formatFullDateTime(timestamp: number): string {
  return `${formatCaptureDate(timestamp)} • ${formatCaptureTime(timestamp)}`;
}

/**
 * Returns ordinal suffix for a given day (e.g. 1st, 2nd, 3rd, 4th, 6th)
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return 'st';
    case 2:  return 'nd';
    case 3:  return 'rd';
    default: return 'th';
  }
}

/**
 * Formats timestamp to "Dth Mon YYYY" (e.g. "6th Mar 2024")
 */
export function formatOrdinalDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

/**
 * Formats timestamp to "hh:mm AM/PM" (e.g. "05:28 PM")
 */
export function formatShortTime(timestamp: number): string {
  const d = new Date(timestamp);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats timestamp to retro digital camera timestamp style: "HH:mm MM.DD.YY" (e.g. "10:18 10.14.26")
 */
export function formatDigitalStamp(timestamp: number): string {
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${hours}:${minutes} ${month}.${day}.${year}`;
}

