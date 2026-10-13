import React from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing, borderRadius } from '../../../core/theme/spacing';

interface PhotoPreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  onSave: () => void;
  onDelete: () => void;
  isSaving?: boolean;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  visible,
  imageUri,
  onSave,
  onDelete,
  isSaving = false,
}) => {
  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDelete}
    >
      <View style={styles.container}>
        {/* Full Screen Watermarked Photo Preview */}
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />

        {/* Top Floating Action Bar */}
        <SafeAreaView style={styles.topBarContainer} edges={['top']}>
          <View style={styles.topBar}>
            {/* Top Left: DELETE */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.btn, styles.deleteBtn]}
              onPress={onDelete}
              disabled={isSaving}
            >
              <Text style={styles.deleteText}>DELETE</Text>
            </TouchableOpacity>

            {/* Top Right: SAVE TO GALLERY */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.btn, styles.saveBtn]}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.saveText}>SAVE TO GALLERY</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  deleteText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    minWidth: 140,
  },
  saveText: {
    ...typography.captionBold,
    color: '#000000',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
});
