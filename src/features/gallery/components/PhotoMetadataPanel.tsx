import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PhotoMetadata } from '../../../shared/types/photoTypes';
import { formatFullDateTime } from '../../../core/utils/dateTimeFormatter';
import {
  formatLatitude,
  formatLongitude,
  formatAccuracy,
} from '../../../core/utils/locationFormatter';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
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

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Date, Time & File Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILE & TIME</Text>
          <View style={styles.row}>
            <Text style={styles.label}>FILENAME</Text>
            <Text style={styles.valMono}>{photo.filename}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DATE & TIME</Text>
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

        {/* GPS Geographic Coordinates & Location Details */}
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
              {photo.location.placeName ? (
                <View style={styles.row}>
                  <Text style={styles.label}>LOCATION NAME</Text>
                  <Text style={styles.val}>{photo.location.placeName}</Text>
                </View>
              ) : null}
              {photo.location.formattedAddress || photo.location.subAddress ? (
                <View style={styles.row}>
                  <Text style={styles.label}>ADDRESS</Text>
                  <Text style={[styles.val, styles.addressVal]}>
                    {photo.location.formattedAddress || photo.location.subAddress}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.noGpsText}>No GPS location acquired at capture time.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    padding: spacing.lg,
    maxHeight: 360,
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
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 280,
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
    alignItems: 'center',
    paddingVertical: 5,
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
    flexShrink: 1,
    textAlign: 'right',
  },
  addressVal: {
    maxWidth: '65%',
  },
  valMono: {
    ...typography.dataMono,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  noGpsText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
