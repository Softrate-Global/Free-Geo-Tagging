import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatermarkData } from '../types/watermarkTypes';
import { formatOrdinalDate, formatShortTime } from '../../../core/utils/dateTimeFormatter';
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

interface WatermarkTemplateProps {
  data: WatermarkData;
  scale?: number;
}

export const WatermarkTemplate: React.FC<WatermarkTemplateProps> = ({ data, scale = 1 }) => {
  const [mapError, setMapError] = useState(false);

  // Structured City / Area / Region title (e.g. "Chandigarh, Chandigarh, India")
  const primaryTitle =
    data.subAddress ||
    data.placeName ||
    (data.latitude != null ? 'GPS Tagged Location' : 'Location Not Available');

  // Detailed street address line
  const detailedAddress =
    data.formattedAddress ||
    (data.placeName && data.placeName !== primaryTitle ? data.placeName : '') ||
    data.subAddress ||
    '';

  const latitudeStr = data.latitude != null ? data.latitude.toFixed(6) : '--';
  const longitudeStr = data.longitude != null ? data.longitude.toFixed(6) : '--';
  const formattedDate = formatOrdinalDate(data.captureTimestamp);
  const formattedTime = formatShortTime(data.captureTimestamp);

  // Static Map snapshot URL
  const staticMapUri =
    data.latitude != null && data.longitude != null
      ? `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=220&height=220&center=lonlat:${data.longitude},${data.latitude}&zoom=16&marker=lonlat:${data.longitude},${data.latitude};color:%23ea4335;size:medium&apiKey=${APP_CONSTANTS.GEOAPIFY_API_KEY}`
      : null;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <View style={styles.row}>
        {/* ──────── Left Card: Rounded Map Snapshot with Pin ──────── */}
        <View style={styles.mapCard}>
          {/* Fallback Vector Map (visible offline or while loading) */}
          <View style={styles.fallbackMap}>
            <View style={styles.roadParkArea} />
            <View style={styles.roadDiagonalMain} />
            <View style={styles.roadDiagonalSub} />
            <View style={styles.pinOverlay}>
              <Ionicons name="location" size={28} color="#EA4335" style={styles.pinShadow} />
            </View>
          </View>

          {/* Real Static Map Snapshot */}
          {!mapError && staticMapUri ? (
            <Image
              source={{ uri: staticMapUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setMapError(true)}
            />
          ) : null}
        </View>

        {/* ──────── Right Card: iOS Frosted Glassmorphism Card ──────── */}
        <View style={styles.glassCard}>
          {/* Line 1: Primary Title (City, State, Country or Place) */}
          <Text style={styles.titleText} numberOfLines={1}>
            {primaryTitle}
          </Text>

          {/* Line 2: Full Detailed Street Address */}
          {detailedAddress ? (
            <Text style={styles.addressText} numberOfLines={2}>
              {detailedAddress}
            </Text>
          ) : null}

          {/* Line 3: Lat & Long Coordinates */}
          <View style={styles.metaRow}>
            <Text style={styles.boldLabel}>Lat </Text>
            <Text style={styles.valueText}>{latitudeStr}  </Text>
            <Text style={styles.boldLabel}>Long </Text>
            <Text style={styles.valueText}>{longitudeStr}</Text>
          </View>

          {/* Line 4: Date & Time */}
          <View style={styles.metaRow}>
            <Text style={styles.boldLabel}>Date </Text>
            <Text style={styles.valueText}>{formattedDate}  </Text>
            <Text style={styles.boldLabel}>Time </Text>
            <Text style={styles.valueText}>{formattedTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  /* ──── Left Map Card ──── */
  mapCard: {
    width: 86,
    height: 86,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E9E6',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fallbackMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  roadParkArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '65%',
    height: '65%',
    backgroundColor: '#D1E7DD',
    borderTopRightRadius: 16,
  },
  roadDiagonalMain: {
    position: 'absolute',
    top: -15,
    left: -20,
    width: 130,
    height: 22,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  roadDiagonalSub: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 90,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  pinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  pinShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },

  /* ──── Right Glassmorphism Card ──── */
  glassCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.76)', // iOS Frosted Glass Translucency
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  titleText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  addressText: {
    color: '#262626',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14.5,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    flexWrap: 'nowrap',
  },
  boldLabel: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  valueText: {
    color: '#1F1F1F',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
