import * as MediaLibrary from 'expo-media-library/legacy';
import { File, Directory, Paths } from 'expo-file-system';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';

export class GalleryService {
  /**
   * Saves a processed watermarked photograph to persistent offline storage
   * and optionally exports to the Android public MediaStore album if supported.
   */
  static async saveToPublicGallery(
    tempImageUri: string,
    filename?: string
  ): Promise<{ assetId?: string; publicUri: string }> {
    const safeFilename = filename || `IMG_${Date.now()}.jpg`;

    let permanentLocalUri = tempImageUri;

    // 1. Permanently persist image in app offline document directory using modern SDK 57 File API
    try {
      const photosDir = new Directory(Paths.document, 'photos');
      if (!photosDir.exists) {
        photosDir.create();
      }
      const destFile = new File(photosDir, safeFilename);
      const srcFile = new File(tempImageUri);
      await srcFile.copy(destFile);
      permanentLocalUri = destFile.uri;
    } catch {
      // If direct copy fails, continue with tempImageUri
      permanentLocalUri = tempImageUri;
    }

    let assetId: string | undefined;
    let publicUri: string = permanentLocalUri;

    // 2. Attempt public Android MediaStore album export (available in development / standalone builds)
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
        } catch {
          // Album grouping notice
        }
      }
    } catch {
      // In Expo Go on Android 13+, public media library export is restricted by Google Play policy.
      // Photo is safely saved in local offline app gallery.
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
      } catch {
        // Media library delete notice
      }
    }

    // 3. Clean up offline image file
    try {
      if (photo.processedUri.startsWith('file://')) {
        const file = new File(photo.processedUri);
        if (file.exists) {
          file.delete();
        }
      }
    } catch {
      // File delete notice
    }
  }

  /**
   * Retrieves all photos for the in-app gallery.
   */
  static async getAppPhotos(): Promise<PhotoMetadata[]> {
    return await LocalMetadataService.getAllPhotos();
  }
}
