import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WatermarkData } from '../types/watermarkTypes';

interface WatermarkTemplateProps {
  data: WatermarkData;
  scale?: number;
}

export const WatermarkTemplate: React.FC<WatermarkTemplateProps> = ({ data, scale = 1 }) => {
  const title = (data.placeName || 'GPS LOCATION').toUpperCase();

  // Always show the FULL structured address (e.g. 60A, Velleeswarar Koil St, Srinivasa Nagar, Mangadu, Chennai - 600122)
  const fullAddress = data.formattedAddress || data.subAddress || '';

  // Dynamically scale font size so long titles never get cut off with "..."
  const titleLength = title.length;
  const dynamicFontSize = titleLength > 26 ? 13 : titleLength > 19 ? 15 : 17;
  const dynamicLetterSpacing = titleLength > 20 ? 1.0 : 1.8;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Top Row: Left Flank Line — BOLD PLACE / BUILDING NAME — Right Flank Line */}
      <View style={styles.titleRow}>
        <View style={styles.flankLine} />
        <Text
          style={[
            styles.placeTitle,
            { fontSize: dynamicFontSize, letterSpacing: dynamicLetterSpacing },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={styles.flankLine} />
      </View>

      {/* Bottom Row: FULL ACCURATE ADDRESS */}
      {fullAddress ? (
        <Text style={styles.subAddressText} numberOfLines={3}>
          {fullAddress}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  flankLine: {
    width: 28,
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
    fontWeight: '800',
    marginHorizontal: 10,
    textAlign: 'center',
    flexShrink: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  subAddressText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
    lineHeight: 18,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
});
