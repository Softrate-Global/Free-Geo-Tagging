import * as ImageManipulator from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import { LocationData } from '../../../shared/types/photoTypes';
import { WatermarkData } from '../types/watermarkTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

export class WatermarkService {
  /**
   * Prepares the structured data for rendering into the watermark.
   */
  static prepareWatermarkData(
    location: LocationData | null,
    captureTimestamp: number
  ): WatermarkData {
    return {
      appName: APP_CONSTANTS.APP_NAME,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      accuracy: location ? location.accuracy : null,
      altitude: location ? location.altitude : null,
      placeName: location?.placeName ?? null,
      subAddress: location?.subAddress ?? null,
      formattedAddress: location?.formattedAddress ?? null,
      captureTimestamp,
    };
  }

  /**
   * Normalizes image orientation and formats to ensure standard JPEG dimensions.
   */
  static async normalizeImage(uri: string): Promise<ImageManipulator.ImageResult> {
    return await ImageManipulator.manipulateAsync(
      uri,
      [], // keep original orientation/dimensions
      {
        compress: APP_CONSTANTS.CAPTURE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
  }

  /**
   * Calculates crop rectangle for a given target aspect ratio.
   * Preserves maximum resolution centered on the image.
   */
  static calculateCrop(
    width: number,
    height: number,
    ratio: import('../../../shared/types/photoTypes').PhotoAspectRatio
  ): { originX: number; originY: number; width: number; height: number } | null {
    if (ratio === 'FULL') return null;

    const isPortrait = height >= width;
    let targetRatio: number;

    if (ratio === '1:1') {
      targetRatio = 1;
    } else if (ratio === '4:3') {
      targetRatio = isPortrait ? 3 / 4 : 4 / 3;
    } else if (ratio === '16:9') {
      targetRatio = isPortrait ? 9 / 16 : 16 / 9;
    } else {
      return null;
    }

    const currentRatio = width / height;
    if (Math.abs(currentRatio - targetRatio) < 0.015) {
      return null; // Already matches desired ratio
    }

    let cropWidth = width;
    let cropHeight = height;

    if (currentRatio > targetRatio) {
      cropWidth = Math.round(height * targetRatio);
    } else {
      cropHeight = Math.round(width / targetRatio);
    }

    const originX = Math.max(0, Math.round((width - cropWidth) / 2));
    const originY = Math.max(0, Math.round((height - cropHeight) / 2));

    return {
      originX,
      originY,
      width: Math.min(cropWidth, width),
      height: Math.min(cropHeight, height),
    };
  }

  /**
   * Applies the selected aspect ratio to a captured photograph.
   */
  static async applyAspectRatio(
    uri: string,
    width: number,
    height: number,
    ratio: import('../../../shared/types/photoTypes').PhotoAspectRatio
  ): Promise<{ uri: string; width: number; height: number }> {
    const crop = this.calculateCrop(width, height, ratio);
    if (!crop) {
      return { uri, width, height };
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop }],
      {
        compress: APP_CONSTANTS.CAPTURE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: manipulated.uri,
      width: manipulated.width,
      height: manipulated.height,
    };
  }

  /**
   * Permanently captures the view containing the image and the watermark
   * into a persistent rasterized image file on the filesystem.
   */
  static async compositeWatermark(viewRef: any): Promise<string> {
    if (!viewRef || !viewRef.current) {
      throw new Error('WATERMARK_REF_NOT_READY');
    }

    const watermarkedUri = await captureRef(viewRef, {
      format: 'jpg',
      quality: APP_CONSTANTS.PROCESSED_QUALITY,
      result: 'tmpfile',
    });

    return watermarkedUri;
  }
}
