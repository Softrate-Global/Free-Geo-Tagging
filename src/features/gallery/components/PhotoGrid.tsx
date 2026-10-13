import React from 'react';
import { FlatList, StyleSheet, useWindowDimensions, RefreshControl } from 'react-native';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { PhotoThumbnail } from './PhotoThumbnail';
import { GalleryEmptyState } from './GalleryEmptyState';

interface PhotoGridProps {
  photos: PhotoMetadata[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectPhoto: (photo: PhotoMetadata) => void;
  onGoToCamera: () => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isRefreshing,
  onRefresh,
  onSelectPhoto,
  onGoToCamera,
}) => {
  const { width } = useWindowDimensions();

  // Multi-dimensional responsive column calculation:
  // Phones: 3 columns; Tablets / Wide screens: 4 or 5 columns
  const numColumns = width >= 768 ? 5 : width >= 500 ? 4 : 3;
  const itemSize = (width - (numColumns + 1) * 3) / numColumns;

  if (photos.length === 0) {
    return <GalleryEmptyState onGoToCamera={onGoToCamera} />;
  }

  return (
    <FlatList
      key={`grid-${numColumns}`}
      data={photos}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <PhotoThumbnail
          photo={item}
          size={itemSize}
          onPress={() => onSelectPhoto(item)}
        />
      )}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
          colors={['#FFFFFF']}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 1.5,
  },
});
