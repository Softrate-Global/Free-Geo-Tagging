import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';

export class GalleryService {
  /**
   * Saves a processed watermarked photograph to the Android public gallery in the "GPS Camera" album.
   */
  static async saveToPublicGallery(
    tempImageUri: string,
    filename?: string
  ): Promise<{ assetId?: string; publicUri: string }> {
    const safeFilename = filename || `IMG_${Date.now()}.jpg`;
    const permanentDirectory = `${FileSystem.documentDirectory}photos/`;

    // 1. Ensure permanent offline directory exists
    await FileSystem.makeDirectoryAsync(permanentDirectory, { intermediates: true }).catch(() => {});
    const permanentLocalUri = `${permanentDirectory}${safeFilename}`;

    // 2. Copy image into permanent offline documents storage
    try {
      await FileSystem.copyAsync({ from: tempImageUri, to: permanentLocalUri });
    } catch (copyErr) {
      console.warn('Notice: fallback to tempImageUri for storage', copyErr);
    }

    let assetId: string | undefined;
    let publicUri: string = permanentLocalUri;

    // 3. Attempt public Android MediaStore album export (supported in standalone/dev builds)
    try {
      const asset = await MediaLibrary.createAssetAsync(permanentLocalUri);
      if (asset) {
        assetId = asset.id;
        publicUri = asset.uri;

        try {
          let album = await MediaLibrary.getAlbumAsync(APP_CONSTANTS.ALBUM_NAME);
          if (!album) {
            await MediaLibrary.createAlbumAsync(APP_CONSTANTS.ALBUM_NAME, asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch (albumErr) {
          console.warn('Album organization notice:', albumErr);
        }
      }
    } catch (mediaLibErr) {
      // In Expo Go on Android 13+, public media library access is restricted by Google Play policy.
      // Photos remain safely persisted in the app offline storage.
      console.warn('Public album export bypassed (safely saved in local app gallery):', mediaLibErr);
    }

    return {
      assetId,
      publicUri,
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
