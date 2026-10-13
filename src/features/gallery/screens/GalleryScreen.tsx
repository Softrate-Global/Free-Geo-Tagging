import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGallery } from '../hooks/useGallery';
import { PhotoGrid } from '../components/PhotoGrid';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { GalleryService } from '../services/galleryService';
import { ShareService } from '../services/shareService';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

interface GalleryScreenProps {
  navigation: any;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const { photos, isLoading, isRefreshing, errorMessage, refreshPhotos } = useGallery();

  // Multi-Select State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchAction, setIsBatchAction] = useState(false);

  // Reload when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPhotos();
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    });
    return unsubscribe;
  }, [navigation, refreshPhotos]);

  const handleSelectPhoto = (photo: PhotoMetadata) => {
    navigation.navigate('PhotoPreview', { photoId: photo.id });
  };

  const handleToggleSelect = (photo: PhotoMetadata) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  };

  const handleLongPressPhoto = (photo: PhotoMetadata) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds(new Set([photo.id]));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // Batch Share to WhatsApp / other apps
  const handleBatchShare = async () => {
    if (selectedIds.size === 0) return;

    const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
    if (selectedPhotos.length === 0) return;

    const uris = selectedPhotos.map((p) => p.processedUri);
    await ShareService.sharePhotos(uris, 'Share Photographs to WhatsApp');
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    Alert.alert(
      `DELETE ${count} PHOTOGRAPH${count > 1 ? 'S' : ''}`,
      `Are you sure you want to permanently delete the selected ${count} photo(s)?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsBatchAction(true);
              const toDelete = photos.filter((p) => selectedIds.has(p.id));
              for (const p of toDelete) {
                await GalleryService.deletePhoto(p);
              }
              handleExitSelection();
              await refreshPhotos();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete selected photos.');
            } finally {
              setIsBatchAction(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* ──────── Top Header ──────── */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerBtn}
              onPress={handleExitSelection}
            >
              <Text style={styles.headerBtnText}>CANCEL</Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{selectedIds.size} SELECTED</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerBtn}
              onPress={handleSelectAll}
            >
              <Text style={styles.headerBtnText}>
                {selectedIds.size === photos.length ? 'DESELECT' : 'ALL'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.headerBtnText}>&lt; CAMERA</Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>IN-APP GALLERY</Text>
              <Text style={styles.counter}>{photos.length} PHOTOS</Text>
            </View>

            {photos.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.headerBtn}
                onPress={() => setIsSelectionMode(true)}
              >
                <Text style={styles.headerBtnText}>SELECT</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* ──────── Main Content ──────── */}
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
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onLongPressPhoto={handleLongPressPhoto}
          />
        )}
      </View>

      {/* ──────── Multi-Select Bottom Action Toolbar ──────── */}
      {isSelectionMode && (
        <View style={styles.bottomBar}>
          {/* Share Button (WhatsApp / Apps) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.bottomActionBtn, selectedIds.size === 0 && styles.bottomActionDisabled]}
            onPress={handleBatchShare}
            disabled={selectedIds.size === 0 || isBatchAction}
          >
            <Ionicons name="share-social-outline" size={22} color={selectedIds.size > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'} />
            <Text style={[styles.bottomActionText, selectedIds.size === 0 && styles.bottomActionTextDisabled]}>
              SHARE ({selectedIds.size})
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.bottomActionBtn, selectedIds.size === 0 && styles.bottomActionDisabled]}
            onPress={handleBatchDelete}
            disabled={selectedIds.size === 0 || isBatchAction}
          >
            {isBatchAction ? (
              <ActivityIndicator size="small" color="#FF453A" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color={selectedIds.size > 0 ? '#FF453A' : 'rgba(255, 69, 58, 0.4)'} />
                <Text style={[styles.bottomActionText, { color: selectedIds.size > 0 ? '#FF453A' : 'rgba(255, 69, 58, 0.4)' }]}>
                  DELETE ({selectedIds.size})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#000000',
  },
  headerBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minWidth: 70,
  },
  headerBtnText: {
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#121216',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bottomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomActionDisabled: {
    opacity: 0.5,
  },
  bottomActionText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  bottomActionTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
