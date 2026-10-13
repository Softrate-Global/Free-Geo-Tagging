import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WatermarkData } from '../types/watermarkTypes';

interface WatermarkTemplateProps {
  data: WatermarkData;
  scale?: number;
}

export const WatermarkTemplate: React.FC<WatermarkTemplateProps> = ({ data, scale = 1 }) => {
  const title = (data.placeName || 'GPS LOCATION').toUpperCase();
  const subtitle = data.subAddress || data.formattedAddress || '';

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Top Row: Left Flank Line — BOLD PLACE NAME — Right Flank Line */}
      <View style={styles.titleRow}>
        <View style={styles.flankLine} />
        <Text style={styles.placeTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.flankLine} />
      </View>

      {/* Bottom Row: Subtitle (e.g. Poonamallee, India) */}
      {subtitle ? (
        <Text style={styles.subAddressText} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  flankLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.9,
    shadowRadius: 2.5,
    elevation: 3,
  },
  placeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginHorizontal: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  subAddressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.6,
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
});
