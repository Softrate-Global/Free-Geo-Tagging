import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoMetadata } from '../types/photoTypes';
import { STORAGE_KEYS } from '../../core/constants/storageConstants';

export class LocalMetadataService {
  /**
   * Retrieves all persisted photo metadata records, ordered newest first.
   */
  static async getAllPhotos(): Promise<PhotoMetadata[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS_METADATA_LIST);
      if (!data) return [];
      const list: PhotoMetadata[] = JSON.parse(data);
      return list.sort((a, b) => b.capturedAt - a.capturedAt);
    } catch (err) {
      console.warn('Failed to load photos metadata from storage', err);
      return [];
    }
  }

  /**
   * Persists a new photo metadata record.
   */
  static async savePhoto(meta: PhotoMetadata): Promise<void> {
    try {
      const currentList = await this.getAllPhotos();
      const updatedList = [meta, ...currentList.filter(p => p.id !== meta.id)];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PHOTOS_METADATA_LIST,
        JSON.stringify(updatedList)
      );
    } catch (err) {
      console.error('Failed to save photo metadata', err);
      throw err;
    }
  }

  /**
   * Removes a photo metadata record by ID.
   */
  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const currentList = await this.getAllPhotos();
      const filtered = currentList.filter(p => p.id !== photoId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PHOTOS_METADATA_LIST,
        JSON.stringify(filtered)
      );
    } catch (err) {
      console.error('Failed to delete photo metadata', err);
      throw err;
    }
  }
}
