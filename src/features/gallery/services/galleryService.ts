import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';

export class GalleryService {
  /**
   * Saves a processed watermarked photograph to the Android public gallery in the "GPS Camera" album.
   */
  static async saveToPublicGallery(
    tempImageUri: string
  ): Promise<{ assetId: string; publicUri: string }> {
    const hasPermission = await MediaLibrary.getPermissionsAsync();
    if (!hasPermission.granted) {
      const requested = await MediaLibrary.requestPermissionsAsync(true);
      if (!requested.granted) {
        throw new Error('MEDIA_LIBRARY_PERMISSION_DENIED');
      }
    }

    // Create asset in Android MediaStore
    const asset = await MediaLibrary.createAssetAsync(tempImageUri);

    // Get or create dedicated album
    let album = await MediaLibrary.getAlbumAsync(APP_CONSTANTS.ALBUM_NAME);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(APP_CONSTANTS.ALBUM_NAME, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    return {
      assetId: asset.id,
      publicUri: asset.uri,
    };
  }

  /**
   * Deletes a photograph from both the public gallery and local persistence.
   */
  static async deletePhoto(photo: PhotoMetadata): Promise<void> {
    // 1. Remove from local database
    await LocalMetadataService.deletePhoto(photo.id);

    // 2. Try removing from device gallery if asset ID exists
    if (photo.mediaAssetId) {
      try {
        await MediaLibrary.deleteAssetsAsync([photo.mediaAssetId]);
      } catch (err) {
        console.warn('Could not delete asset from MediaLibrary directly', err);
      }
    }

    // 3. Clean up processed temporary file if it was in file system
    try {
      if (photo.processedUri.startsWith('file://')) {
        const info = await FileSystem.getInfoAsync(photo.processedUri);
        if (info.exists) {
          await FileSystem.deleteAsync(photo.processedUri, { idempotent: true });
        }
      }
    } catch (err) {
      console.warn('Could not delete temporary image file', err);
    }
  }

  /**
   * Retrieves all photos for the in-app gallery.
   */
  static async getAppPhotos(): Promise<PhotoMetadata[]> {
    return await LocalMetadataService.getAllPhotos();
  }
}
