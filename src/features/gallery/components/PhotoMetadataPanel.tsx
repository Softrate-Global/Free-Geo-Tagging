import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { formatLatitude, formatLongitude, formatAccuracy, formatAltitude } from '../../../core/utils/locationFormatter';
import { formatFullDateTime } from '../../../core/utils/dateTimeFormatter';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing, borderRadius } from '../../../core/theme/spacing';
import { AppButton } from '../../../shared/components/AppButton';

interface PhotoMetadataPanelProps {
  photo: PhotoMetadata;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const PhotoMetadataPanel: React.FC<PhotoMetadataPanelProps> = ({
  photo,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.panelTitle}>PHOTO METADATA</Text>
        <AppButton
          title="DELETE"
          onPress={onDelete}
          variant="danger"
          size="sm"
          loading={isDeleting}
        />
      </View>

      <ScrollView style={styles.scrollArea}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILE INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>FILENAME</Text>
            <Text style={styles.valMono}>{photo.filename}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CAPTURED</Text>
            <Text style={styles.val}>{formatFullDateTime(photo.capturedAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ALBUM</Text>
            <Text style={styles.val}>Free Geo Tagging (Public Gallery)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WATERMARK</Text>
            <Text style={styles.val}>Permanently Embedded</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GEOGRAPHICAL LOCATION</Text>
          {photo.location ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>LATITUDE</Text>
                <Text style={styles.valMono}>{formatLatitude(photo.location.latitude)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>LONGITUDE</Text>
                <Text style={styles.valMono}>{formatLongitude(photo.location.longitude)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>ACCURACY</Text>
                <Text style={styles.valMono}>{formatAccuracy(photo.location.accuracy)}</Text>
              </View>
              {photo.location.altitude != null && (
                <View style={styles.row}>
                  <Text style={styles.label}>ALTITUDE</Text>
                  <Text style={styles.valMono}>{formatAltitude(photo.location.altitude)}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noGpsText}>No GPS coordinates acquired at capture time.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    padding: spacing.lg,
    maxHeight: 280,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  panelTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    letterSpacing: 1.2,
  },
  scrollArea: {
    maxHeight: 200,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8,
  },
  val: {
    ...typography.caption,
    color: '#FFFFFF',
  },
  valMono: {
    ...typography.dataMono,
    color: '#FFFFFF',
    fontSize: 11,
  },
  noGpsText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
