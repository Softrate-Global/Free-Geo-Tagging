import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { PhotoMetadataPanel } from '../components/PhotoMetadataPanel';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';
import { GalleryService } from '../services/galleryService';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

interface PhotoPreviewScreenProps {
  route: any;
  navigation: any;
}

export const PhotoPreviewScreen: React.FC<PhotoPreviewScreenProps> = ({
  route,
  navigation,
}) => {
  const { photoId } = route.params;
  const { width, height } = useWindowDimensions();

  const [photo, setPhoto] = useState<PhotoMetadata | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadTargetPhoto() {
      const photos = await LocalMetadataService.getAllPhotos();
      const found = photos.find((p) => p.id === photoId);
      if (found) {
        setPhoto(found);
      } else {
        Alert.alert('Error', 'Photograph not found in local gallery.');
        navigation.goBack();
      }
    }
    loadTargetPhoto();
  }, [photoId, navigation]);

  const handleDelete = () => {
    if (!photo) return;

    Alert.alert(
      'DELETE PHOTOGRAPH',
      'Are you sure you want to permanently delete this photo from the app and device gallery?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await GalleryService.deletePhoto(photo);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete photograph.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!photo) {
    return (
      <View style={styles.center}>
        <LoadingIndicator message="Loading photo..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>&lt; BACK</Text>
        </TouchableOpacity>

        <Text style={styles.filename} numberOfLines={1}>
          {photo.filename}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.infoBtn, showMetadata && styles.infoBtnActive]}
          onPress={() => setShowMetadata((cur) => !cur)}
        >
          <Text style={[styles.infoText, showMetadata && styles.infoTextActive]}>
            {showMetadata ? 'HIDE INFO' : 'INFO'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Full-Screen Zoomable Image */}
      <ScrollView
        style={styles.zoomContainer}
        contentContainerStyle={styles.zoomContent}
        maximumZoomScale={3.5}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: photo.processedUri }}
          style={[styles.fullImage, { width, height: height * 0.75 }]}
          resizeMode="contain"
        />
      </ScrollView>

      {/* Bottom Metadata Panel when toggled */}
      {showMetadata && (
        <PhotoMetadataPanel
          photo={photo}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
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
  filename: {
    ...typography.dataMono,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  infoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  infoBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  infoText: {
    ...typography.micro,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  infoTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  zoomContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  fullImage: {
    backgroundColor: '#000000',
  },
});
