import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WatermarkData } from '../types/watermarkTypes';
import { formatLatitude, formatLongitude, formatAccuracy, formatAltitude } from '../../../core/utils/locationFormatter';
import { formatCaptureDate, formatCaptureTime } from '../../../core/utils/dateTimeFormatter';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing, borderRadius } from '../../../core/theme/spacing';

interface WatermarkTemplateProps {
  data: WatermarkData;
  scale?: number;
}

export const WatermarkTemplate: React.FC<WatermarkTemplateProps> = ({ data, scale = 1 }) => {
  const hasCoordinates = data.latitude !== null && data.longitude !== null;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <View style={styles.headerRow}>
        <View style={styles.brandingBadge}>
          <Text style={styles.headerText}>{data.appName || 'FREE GEO TAGGING'}</Text>
        </View>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE FIX</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {hasCoordinates ? (
          <>
            <View style={styles.dataRow}>
              <Text style={styles.label}>LAT</Text>
              <Text style={styles.value}>{formatLatitude(data.latitude!)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>LON</Text>
              <Text style={styles.value}>{formatLongitude(data.longitude!)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>ACC</Text>
              <Text style={styles.value}>{formatAccuracy(data.accuracy)}</Text>
            </View>
            {data.altitude != null && (
              <View style={styles.dataRow}>
                <Text style={styles.label}>ALT</Text>
                <Text style={styles.value}>{formatAltitude(data.altitude)}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.dataRow}>
            <Text style={styles.label}>GPS</Text>
            <Text style={styles.value}>UNAVAILABLE AT CAPTURE</Text>
          </View>
        )}

        <View style={styles.subDivider} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            {formatCaptureDate(data.captureTimestamp)} • {formatCaptureTime(data.captureTimestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minWidth: 260,
    maxWidth: 340,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandingBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  headerText: {
    ...typography.watermarkHeading,
    color: '#000000',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  offlineBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  offlineText: {
    ...typography.micro,
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.xs,
  },
  content: {
    marginTop: spacing.xxs,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 1.5,
  },
  label: {
    ...typography.captionBold,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  value: {
    ...typography.dataMono,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  subDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  footerRow: {
    alignItems: 'flex-start',
  },
  footerText: {
    ...typography.dataMono,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
  },
});
