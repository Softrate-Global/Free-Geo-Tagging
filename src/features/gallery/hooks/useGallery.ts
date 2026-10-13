import { useState, useEffect, useCallback } from 'react';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { GalleryService } from '../services/galleryService';

export function useGallery() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      setErrorMessage(null);
      const list = await GalleryService.getAppPhotos();
      setPhotos(list);
    } catch (err: any) {
      setErrorMessage('Failed to load photos from storage.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshPhotos = useCallback(() => {
    setIsRefreshing(true);
    loadPhotos();
  }, [loadPhotos]);

  const deletePhoto = useCallback(async (photo: PhotoMetadata) => {
    try {
      await GalleryService.deletePhoto(photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    isLoading,
    isRefreshing,
    errorMessage,
    refreshPhotos,
    deletePhoto,
  };
}
