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
  onTurnOnLocation?: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  status,
  location,
  onRefresh,
  onEditLocation,
  onTurnOnLocation,
}) => {
  const isAcquired = status === 'ACQUIRED';
  const isWarning = status === 'INSUFFICIENT_ACCURACY';
  const isLocationDisabled = status === 'SERVICES_DISABLED' || status === 'PERMISSION_DENIED';

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
          {isLocationDisabled && onTurnOnLocation ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.actionBtn, styles.actionBtnWarning]}
              onPress={onTurnOnLocation}
            >
              <Text style={[styles.actionBtnText, styles.actionBtnWarningText]}>TURN ON</Text>
            </TouchableOpacity>
          ) : onRefresh ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={onRefresh}
            >
              <Text style={styles.actionBtnText}>RETRY GPS</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Place / Building Name & Full Address */}
      <View style={styles.placeRow}>
        <View style={styles.placeTitleRow}>
          <Text style={styles.placeTitle} numberOfLines={1}>
            {location?.placeName
              ? location.placeName.toUpperCase()
              : isLocationDisabled
              ? 'GPS LOCATION TURNED OFF'
              : status === 'ACQUIRING'
              ? 'ACQUIRING SATELLITE FIX...'
              : 'GPS SIGNAL SEARCHING...'}
          </Text>
        </View>
        <Text style={styles.placeSub} numberOfLines={1}>
          {addressText ||
            (isLocationDisabled
              ? 'Tap Turn On to enable GPS location tagging'
              : status === 'ACQUIRING'
              ? 'Connecting to GPS satellites'
              : 'Keep device still or move closer to open sky')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    width: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtnWarning: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  actionBtnText: {
    ...typography.micro,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actionBtnWarningText: {
    color: '#FBBF24',
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  placeSub: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
  },
});
