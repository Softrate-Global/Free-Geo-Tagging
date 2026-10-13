import { formatCaptureDate, formatCaptureTime, formatFullDateTime } from '../src/core/utils/dateTimeFormatter';

describe('Date & Time Formatter', () => {
  test('formats capture date correctly', () => {
    const timestamp = new Date(2026, 9, 13, 11, 42, 0).getTime(); // Oct 13 2026
    expect(formatCaptureDate(timestamp)).toBe('13 Oct 2026');
  });

  test('formats capture time in 12-hour AM/PM format', () => {
    const morning = new Date(2026, 9, 13, 9, 5, 8).getTime();
    expect(formatCaptureTime(morning)).toBe('09:05:08 AM');

    const afternoon = new Date(2026, 9, 13, 15, 30, 45).getTime();
    expect(formatCaptureTime(afternoon)).toBe('03:30:45 PM');
  });

  test('formats full date and time string', () => {
    const timestamp = new Date(2026, 9, 13, 11, 42, 0).getTime();
    expect(formatFullDateTime(timestamp)).toBe('13 Oct 2026 • 11:42:00 AM');
  });
});
