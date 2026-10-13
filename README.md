# Free Geo Tagging

A professional, production-ready offline Android camera application built with **React Native**, **TypeScript**, and **Expo**.

The application captures photographs, acquires offline high-accuracy GPS coordinates directly from device hardware sensors, permanently embeds location metadata into the image as a watermark, saves the resulting photo to the device's public Android MediaStore gallery (`Free Geo Tagging` album), and provides an in-app gallery for browsing, previewing, and managing photos.

---

## Key Features

- **100% Fully Offline**: Works without network connectivity or remote servers. All GPS acquisition, image processing, watermark compositing, and photo storage operate strictly on-device.
- **Strict Minimalist Monochrome UI**: Clean, high-contrast black & white interface (`#000000` / `#FFFFFF`) with zero emojis.
- **Live Camera Viewfinder**: Front/rear camera toggle, flash/torch control (`OFF`, `ON`, `AUTO`), prominent shutter button, and processing indicators.
- **Accurate GPS Reporting**: Live HUD displaying satellite-acquired Latitude, Longitude, and Horizontal Accuracy in meters (`±X m`).
- **Permanent Watermark Compositing**: Renders and bakes location data (Latitude, Longitude, Accuracy, Altitude, Date, Time) into the actual image pixels.
- **Public Android Gallery Storage**: Saves watermarked photographs directly to the public Android MediaStore in the dedicated `Free Geo Tagging` album.
- **In-App Gallery**: Responsive multi-column thumbnail grid with pull-to-refresh and empty-state display.
- **Full-Screen Photo Preview**: Pinch-to-zoom support, toggleable metadata drawer, and photo deletion.
- **Offline Metadata Persistence**: Local storage of photo records.
- **Multi-Dimensional Screen Adaptation**: Responsive layout tested for phones, foldables, and tablets without overflow issues.

---

## Tech Stack

- **Framework**: React Native 0.86, Expo SDK 57, TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Camera**: `expo-camera` (`CameraView`)
- **Location**: `expo-location` (High accuracy satellite fix)
- **Image Compositing**: `react-native-view-shot`, `expo-image-manipulator`
- **Media & Storage**: `expo-media-library`, `@react-native-async-storage/async-storage`
- **Testing**: Jest, `ts-jest`

---

## Project Structure

```
├── android/                             # Android native files (Continuous Native Generation)
├── src/
│   ├── app/
│   │   ├── AppNavigator.tsx             # Native Stack Navigator
│   │   └── providers/AppProviders.tsx   # Root Theme and SafeArea Providers
│   ├── core/
│   │   ├── constants/                   # Application and storage constants
│   │   ├── theme/                       # Colors, Spacing, Typography
│   │   └── utils/                       # Location, Date/Time, and Filename utilities
│   ├── features/
│   │   ├── camera/                      # CameraScreen, Controls, HUD, CameraService
│   │   ├── location/                    # LocationService, useLocation hook
│   │   ├── watermark/                   # WatermarkTemplate, WatermarkService
│   │   ├── gallery/                     # GalleryScreen, Preview, MetadataPanel
│   │   └── permissions/                 # Runtime permission handlers
│   └── shared/
│       ├── components/                  # Reusable UI components (AppButton, etc.)
│       └── services/                    # LocalMetadataService
└── tests/                               # Comprehensive Jest unit test suites
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Run TypeScript type check
npx tsc --noEmit

# Run unit tests
npm test

# Run Expo Doctor diagnostic
npx expo-doctor
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on Android device / emulator
npx expo run:android
```

---

## License

MIT
