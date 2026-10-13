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
import { Ionicons } from '@expo/vector-icons';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { PhotoMetadataPanel } from '../components/PhotoMetadataPanel';
import { LocalMetadataService } from '../../../shared/services/localMetadataService';
import { GalleryService } from '../services/galleryService';
import { ShareService } from '../services/shareService';
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

  const handleShare = async () => {
    if (!photo) return;
    await ShareService.shareSinglePhoto(photo.processedUri, 'Share Photograph to WhatsApp');
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
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.filename} numberOfLines={1}>
          {photo.filename}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerShareBtn}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
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
          style={[styles.fullImage, { width, height: height * 0.72 }]}
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

      {/* ──────── Bottom Action Toolbar ──────── */}
      <View style={styles.bottomToolbar}>
        {/* Delete Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.toolBtn}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={22} color="#FF453A" />
          <Text style={[styles.toolText, { color: '#FF453A' }]}>DELETE</Text>
        </TouchableOpacity>

        {/* Info Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.toolBtn, showMetadata && styles.toolBtnActive]}
          onPress={() => setShowMetadata((cur) => !cur)}
        >
          <Ionicons
            name={showMetadata ? 'information-circle' : 'information-circle-outline'}
            size={22}
            color={showMetadata ? '#007AFF' : '#FFFFFF'}
          />
          <Text style={[styles.toolText, showMetadata && { color: '#007AFF' }]}>
            {showMetadata ? 'HIDE INFO' : 'INFO'}
          </Text>
        </TouchableOpacity>

        {/* Share to WhatsApp Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.shareBtn}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={18} color="#000000" style={{ marginRight: 6 }} />
          <Text style={styles.shareBtnText}>SHARE</Text>
        </TouchableOpacity>
      </View>
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
  headerShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121216',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  toolText: {
    ...typography.micro,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  shareBtnText: {
    ...typography.captionBold,
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
