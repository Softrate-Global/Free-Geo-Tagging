import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGallery } from '../hooks/useGallery';
import { PhotoGrid } from '../components/PhotoGrid';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

interface GalleryScreenProps {
  navigation: any;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const { photos, isLoading, isRefreshing, errorMessage, refreshPhotos } = useGallery();

  // Reload when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPhotos();
    });
    return unsubscribe;
  }, [navigation, refreshPhotos]);

  const handleSelectPhoto = (photo: PhotoMetadata) => {
    navigation.navigate('PhotoPreview', { photoId: photo.id });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.backText}>&lt; CAMERA</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>IN-APP GALLERY</Text>
          <Text style={styles.counter}>{photos.length} PHOTOS</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.refreshBtn}
          onPress={refreshPhotos}
        >
          <Text style={styles.refreshText}>REFRESH</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {isLoading && !isRefreshing ? (
          <LoadingIndicator message="Loading captured photos..." />
        ) : errorMessage ? (
          <ErrorMessage
            title="STORAGE ERROR"
            message={errorMessage}
            onRetry={refreshPhotos}
          />
        ) : (
          <PhotoGrid
            photos={photos}
            isRefreshing={isRefreshing}
            onRefresh={refreshPhotos}
            onSelectPhoto={handleSelectPhoto}
            onGoToCamera={() => navigation.navigate('Camera')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: '#000000',
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.subtitle,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  counter: {
    ...typography.micro,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  refreshBtn: {
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
  refreshText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
