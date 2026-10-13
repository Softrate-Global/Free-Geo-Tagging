import { PhotoMetadata } from '../../../shared/types/photoTypes';

export interface GalleryState {
  photos: PhotoMetadata[];
  isLoading: boolean;
  isRefreshing: boolean;
  selectedPhoto: PhotoMetadata | null;
  errorMessage: string | null;
}
