import { generatePhotoFilename } from '../src/core/utils/filenameGenerator';

describe('Filename Generator', () => {
  test('generates unique filename with GPS prefix and timestamp format', () => {
    const timestamp = new Date(2026, 9, 13, 11, 42, 5, 123).getTime(); // Oct 13 2026 11:42:05.123
    const filename = generatePhotoFilename(timestamp);

    expect(filename).toMatch(/^GPS_\d{8}_\d{6}_\d{3}\.jpg$/);
    expect(filename).toContain('GPS_20261013_114205_123.jpg');
  });

  test('does not generate duplicate names for successive timestamps', () => {
    const t1 = Date.now();
    const t2 = t1 + 1;
    expect(generatePhotoFilename(t1)).not.toBe(generatePhotoFilename(t2));
  });
});
