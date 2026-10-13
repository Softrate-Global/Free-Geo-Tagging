import { CameraType, FlashMode } from 'expo-camera';

export interface CameraState {
  facing: CameraType;
  flash: FlashMode;
  isReady: boolean;
  isCapturing: boolean;
  isProcessing: boolean;
  processingStep: string;
  lastCapturedUri: string | null;
  errorMessage: string | null;
}
