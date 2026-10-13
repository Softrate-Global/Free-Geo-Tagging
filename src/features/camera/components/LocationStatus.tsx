import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GPSStatus, LocationData } from '../../../shared/types/photoTypes';
import { getGPSStatusLabel } from '../../../core/utils/locationFormatter';
import { typography } from '../../../core/theme/typography';
import { spacing, borderRadius } from '../../../core/theme/spacing';

interface LocationStatusProps {
  status: GPSStatus;
  location: LocationData | null;
  onRefresh?: () => void;
  onEditLocation?: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  status,
  location,
  onRefresh,
  onEditLocation,
}) => {
  const isAcquired = status === 'ACQUIRED';
  const isWarning = status === 'INSUFFICIENT_ACCURACY';

  const addressText = location?.formattedAddress || location?.subAddress || '';

  return (
    <View style={styles.container}>
      {/* Header: GPS Status Dot + Label & Action Buttons */}
      <View style={styles.headerRow}>
        <View style={styles.indicatorContainer}>
          <View
            style={[
              styles.statusDot,
              isAcquired
                ? styles.dotAcquired
                : isWarning
                ? styles.dotWarning
                : styles.dotOffline,
            ]}
          />
          <Text style={styles.statusLabel}>
            {getGPSStatusLabel(status, location?.accuracy)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {onEditLocation && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={onEditLocation}
            >
              <Text style={styles.actionBtnText}>EDIT PLACE</Text>
            </TouchableOpacity>
          )}

          {onRefresh && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={onRefresh}
            >
              <Text style={styles.actionBtnText}>RETRY GPS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Place / Building Name & Full Address (LAT, LON, ACC removed) */}
      {location?.placeName ? (
        <TouchableOpacity
          activeOpacity={onEditLocation ? 0.75 : 1}
          onPress={onEditLocation}
          style={styles.placeRow}
        >
          <View style={styles.placeTitleRow}>
            <Text style={styles.placeTitle} numberOfLines={1}>
              {location.placeName.toUpperCase()}
            </Text>
          </View>
          {addressText ? (
            <Text style={styles.placeSub} numberOfLines={2}>
              {addressText}
            </Text>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAcquired: {
    backgroundColor: '#FFFFFF',
  },
  dotWarning: {
    backgroundColor: '#A1A1A6',
  },
  dotOffline: {
    backgroundColor: '#38383A',
  },
  statusLabel: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionBtnText: {
    ...typography.micro,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  placeRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  placeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeTitle: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  placeSub: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
});
