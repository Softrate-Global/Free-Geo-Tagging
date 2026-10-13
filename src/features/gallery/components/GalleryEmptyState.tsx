import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { AppButton } from '../../../shared/components/AppButton';

interface GalleryEmptyStateProps {
  onGoToCamera: () => void;
}

export const GalleryEmptyState: React.FC<GalleryEmptyStateProps> = ({ onGoToCamera }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>[ 0 ]</Text>
      </View>
      <Text style={styles.title}>NO PHOTOGRAPHS YET</Text>
      <Text style={styles.description}>
        Photographs captured using Free Geo Tagging will appear here with embedded offline geographical coordinates.
      </Text>
      <AppButton
        title="OPEN CAMERA"
        onPress={onGoToCamera}
        variant="primary"
        size="md"
        style={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: '#121212',
  },
  iconText: {
    ...typography.title,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    minWidth: 160,
  },
});
