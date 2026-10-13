import { CameraView } from 'expo-camera';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

export class CameraService {
  /**
   * Captures raw photograph from CameraView instance
   */
  static async capturePhoto(cameraRef: CameraView | null): Promise<{ uri: string; width: number; height: number }> {
    if (!cameraRef) {
      throw new Error('CAMERA_NOT_READY');
    }

    const picture = await cameraRef.takePictureAsync({
      quality: APP_CONSTANTS.CAPTURE_QUALITY,
      skipProcessing: false,
    });

    if (!picture || !picture.uri) {
      throw new Error('CAPTURE_FAILED');
    }

    return {
      uri: picture.uri,
      width: picture.width,
      height: picture.height,
    };
  }
}
