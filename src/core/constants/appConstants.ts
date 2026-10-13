export const APP_CONSTANTS = {
  APP_NAME: 'FREE GEO TAGGING',
  ALBUM_NAME: 'Free Geo Tagging',
  ONBOARDING_COMPLETED_KEY: '@has_completed_onboarding_v1',
  
  // GPS Acquisition parameters
  TARGET_ACCURACY_METERS: 20, // Desired horizontal accuracy in meters
  HIGH_ACCURACY_THRESHOLD: 10,
  ACCEPTABLE_ACCURACY_THRESHOLD: 30,
  LOCATION_TIMEOUT_MS: 30000, // 30 seconds max wait
  LOCATION_UPDATE_INTERVAL_MS: 1500, // Background polling / watch interval
  LOCATION_DISTANCE_FILTER_METERS: 1,

  // Watermark parameters
  WATERMARK_PADDING_RATIO: 0.02, // 2% from border
  WATERMARK_WIDTH_RATIO: 0.55,  // 55% of image width on composite
  WATERMARK_BG_OPACITY: 0.78,

  // Image quality
  CAPTURE_QUALITY: 0.95,
  PROCESSED_QUALITY: 0.92,
  THUMBNAIL_MAX_DIMENSION: 400,

  // Storage
  STORAGE_PREFIX: '@gps_cam_',

  // Geoapify API Key (Free tier: 3,000 requests/day, no credit card required)
  // Obtain free key from: https://www.geoapify.com/
  GEOAPIFY_API_KEY: '535efc39b8c3452aa07c1819d666f3bb',
} as const;
