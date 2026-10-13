import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../core/theme/colors';
import { typography } from '../../core/theme/typography';
import { spacing, borderRadius } from '../../core/theme/spacing';
import { AppButton } from './AppButton';
import { PermissionService } from '../../features/permissions/services/permissionService';

interface PermissionRequestViewProps {
  cameraMissing?: boolean;
  locationMissing?: boolean;
  mediaMissing?: boolean;
  onRequestPermissions: () => void;
}

export const PermissionRequestView: React.FC<PermissionRequestViewProps> = ({
  cameraMissing = false,
  locationMissing = false,
  mediaMissing = false,
  onRequestPermissions,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>FREE GEO TAGGING</Text>
          <Text style={styles.subtitle}>OFFLINE HARDWARE PERMISSIONS</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>REQUIRED DEVICE ACCESS</Text>
          <Text style={styles.cardDesc}>
            To operate completely offline, this application requires access to your device's native hardware sensors:
          </Text>

          {cameraMissing && (
            <View style={styles.permRow}>
              <View style={styles.bullet} />
              <View style={styles.permContent}>
                <Text style={styles.permTitle}>CAMERA SENSOR</Text>
                <Text style={styles.permDetail}>
                  Required to display the live viewfinder and capture photographs.
                </Text>
              </View>
            </View>
          )}

          {locationMissing && (
            <View style={styles.permRow}>
              <View style={styles.bullet} />
              <View style={styles.permContent}>
                <Text style={styles.permTitle}>GPS LOCATION (PRECISE)</Text>
                <Text style={styles.permDetail}>
                  Required to acquire real-time coordinates, altitude, and horizontal accuracy directly from satellites.
                </Text>
              </View>
            </View>
          )}

          {mediaMissing && (
            <View style={styles.permRow}>
              <View style={styles.bullet} />
              <View style={styles.permContent}>
                <Text style={styles.permDetailBold}>STORAGE / MEDIA GALLERY</Text>
                <Text style={styles.permDetail}>
                  Required to save final watermarked photos into the dedicated Free Geo Tagging public album.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            PRIVACY GUARANTEE: All processing is strictly offline. No network requests, cloud syncing, accounts, or analytics.
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="GRANT PERMISSIONS"
            onPress={onRequestPermissions}
            variant="primary"
            size="lg"
            style={styles.actionBtn}
          />

          <AppButton
            title="OPEN DEVICE SETTINGS"
            onPress={PermissionService.openSettings}
            variant="outline"
            size="md"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  appTitle: {
    ...typography.header,
    color: colors.textPrimary,
    letterSpacing: 2.5,
  },
  subtitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeading: {
    ...typography.subtitle,
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  permRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
    marginRight: spacing.sm,
  },
  permContent: {
    flex: 1,
  },
  permTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  permDetailBold: {
    ...typography.captionBold,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  permDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  privacyNote: {
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  privacyText: {
    ...typography.micro,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  actions: {
    gap: spacing.md,
  },
  actionBtn: {
    width: '100%',
  },
});
