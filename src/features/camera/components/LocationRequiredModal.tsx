import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

interface LocationRequiredModalProps {
  visible: boolean;
  onGoToSettings: () => void;
  onClose: () => void;
}

export const LocationRequiredModal: React.FC<LocationRequiredModalProps> = ({
  visible,
  onGoToSettings,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Warning Location Icon Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="location-sharp" size={32} color="#FBBF24" />
          </View>

          {/* Title */}
          <Text style={styles.title}>TURN ON LOCATION</Text>

          {/* Description */}
          <Text style={styles.description}>
            Device location is turned off. Please turn on location to capture photos
            with accurate GPS coordinates, place name, and address geotags.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Go to Settings Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryBtn}
              onPress={onGoToSettings}
            >
              <Ionicons name="settings-outline" size={18} color="#000000" style={styles.btnIcon} />
              <Text style={styles.primaryBtnText}>GO TO SETTINGS</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#18181A',
    borderRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnIcon: {
    marginRight: spacing.xs,
  },
  primaryBtnText: {
    ...typography.captionBold,
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cancelBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelBtnText: {
    ...typography.captionBold,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    fontSize: 12,
  },
});
