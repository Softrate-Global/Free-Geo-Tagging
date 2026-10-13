import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GPSStatus, LocationData } from '../../../shared/types/photoTypes';
import { formatLatitude, formatLongitude, formatAccuracy, getGPSStatusLabel } from '../../../core/utils/locationFormatter';
import { colors } from '../../../core/theme/colors';
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

  return (
    <View style={styles.container}>
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

      {location && (
        <>
          {location.placeName ? (
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
              {location.subAddress || location.formattedAddress ? (
                <Text style={styles.placeSub} numberOfLines={1}>
                  {location.subAddress || location.formattedAddress}
                </Text>
              ) : null}
            </TouchableOpacity>
          ) : null}

          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>LAT</Text>
              <Text style={styles.dataVal}>{formatLatitude(location.latitude, 5)}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>LON</Text>
              <Text style={styles.dataVal}>{formatLongitude(location.longitude, 5)}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>ACC</Text>
              <Text style={styles.dataVal}>{formatAccuracy(location.accuracy)}</Text>
            </View>
          </View>
        </>
      )}
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
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  dataItem: {
    alignItems: 'flex-start',
  },
  dataLabel: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.6,
  },
  dataVal: {
    ...typography.dataMono,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  placeSub: {
    ...typography.micro,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9.5,
    marginTop: 1,
  },
});
