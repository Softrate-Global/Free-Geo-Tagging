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
