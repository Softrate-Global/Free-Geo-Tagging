import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionService } from '../../permissions/services/permissionService';

const STORAGE_KEY_ONBOARDING = '@has_seen_onboarding_v1';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsStarting(true);
      // Request Camera and Location permissions smoothly on onboarding
      await PermissionService.requestCamera();
      await PermissionService.requestLocation();
      await PermissionService.requestMediaLibrary();

      // Persist onboarding state
      await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');

      // Navigate to camera viewfinder
      navigation.replace('Camera');
    } catch (err) {
      console.warn('Onboarding navigation notice:', err);
      navigation.replace('Camera');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dark status bar text/icons (time, battery, wifi) visible on white background */}
      <StatusBar style="dark" />

      {/* ──────── TOP DECORATIVE & SKELETON CAMERA SECTION ──────── */}
      <View style={styles.illustrationArea}>
        {/* Spacious, balanced floating festive party papers */}
        {/* 1. Top Left Pink Squiggle */}
        <View style={[styles.floatingItem, styles.posTopLeftSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#F472B6' }]}>~</Text>
        </View>

        {/* 2. Top Center Yellow Hollow Triangle */}
        <View style={[styles.floatingItem, styles.posTopCenterTriangle]}>
          <View style={styles.triangleYellow} />
        </View>

        {/* 3. Top Right Green Hollow Diamond */}
        <View style={[styles.floatingItem, styles.posTopRightDiamond]}>
          <View style={styles.diamondGreen} />
        </View>

        {/* 4. Upper Left Purple Slash */}
        <View style={[styles.floatingItem, styles.posUpperLeftSlash]}>
          <View style={styles.slashPurple} />
        </View>

        {/* 5. Upper Right Cyan Squiggle */}
        <View style={[styles.floatingItem, styles.posUpperRightSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#06B6D4' }]}>~</Text>
        </View>

        {/* 6. Mid Left Cyan Hollow Square */}
        <View style={[styles.floatingItem, styles.posMidLeftSquare]}>
          <View style={styles.squareCyan} />
        </View>

        {/* 7. Mid Right Purple Triangle */}
        <View style={[styles.floatingItem, styles.posMidRightTriangle]}>
          <View style={styles.trianglePurple} />
        </View>

        {/* 8. Lower Left Green Dot */}
        <View style={[styles.floatingItem, styles.posLowerLeftDot]}>
          <View style={styles.dotGreen} />
        </View>

        {/* 9. Lower Center Yellow Ring */}
        <View style={[styles.floatingItem, styles.posLowerCenterRing]}>
          <View style={styles.ringYellow} />
        </View>

        {/* 10. Lower Right Cyan Squiggle */}
        <View style={[styles.floatingItem, styles.posLowerRightSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#22D3EE' }]}>~</Text>
        </View>

        {/* 11. Bottom Right Soft Purple Triangle */}
        <View style={[styles.floatingItem, styles.posBottomRightTriangle]}>
          <View style={styles.triangleSoftPurple} />
        </View>

        {/* ──────── BLACK SKELETON / OUTLINE CAMERA ICON (NO BACKGROUND BLOB) ──────── */}
        <View style={styles.skeletonCameraWrapper}>
          {/* Top Shutter Tab */}
          <View style={styles.shutterTab} />

          {/* Camera Skeleton Body (Pure Transparent with Black Stroke) */}
          <View style={styles.skeletonCameraBody}>
            {/* Top Right Flash Indicator */}
            <View style={styles.flashWindow} />

            {/* Outer Lens Ring */}
            <View style={styles.lensRingOuter}>
              {/* Inner Concentric Lens Ring */}
              <View style={styles.lensRingInner}>
                {/* Center Pupil with Reflection */}
                <View style={styles.lensPupil}>
                  <View style={styles.lensReflection} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ──────── MIDDLE CONTENT SECTION ──────── */}
      <View style={styles.contentArea}>
        {/* Single-line Headline with Current App Name */}
        <Text
          style={styles.headlineText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Welcome to Free Geo Tagging
        </Text>

        {/* Short, punchy 2-line description */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          Turn on GPS so Free Geo Tagging can accurately geotag your photos with company and address details.
        </Text>
      </View>

      {/* ──────── BOTTOM SOLID BLACK BUTTON SECTION ──────── */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.getStartedText}>Let’s Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  illustrationArea: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },

  /* ──────── Skeleton / Line-Art Camera Icon (No Background Blob) ──────── */
  skeletonCameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  shutterTab: {
    width: 26,
    height: 7,
    backgroundColor: '#000000',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginRight: 52,
    marginBottom: -1,
  },
  skeletonCameraBody: {
    width: 136,
    height: 92,
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: 3.5,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flashWindow: {
    position: 'absolute',
    top: 13,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  lensRingOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3.5,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensRingInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.2,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensPupil: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    position: 'relative',
  },
  lensReflection: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#FFFFFF',
  },

  /* ──────── Spacious & Balanced Festive Floating Elements ──────── */
  floatingItem: {
    position: 'absolute',
    zIndex: 2,
  },
  squiggleText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 28,
  },
  posTopLeftSquiggle: {
    top: 25,
    left: 42,
    transform: [{ rotate: '25deg' }],
  },
  posTopCenterTriangle: {
    top: 15,
    left: '48%',
  },
  triangleYellow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
  },
  posTopRightDiamond: {
    top: 22,
    right: 42,
  },
  diamondGreen: {
    width: 14,
    height: 14,
    borderColor: '#86EFAC',
    borderWidth: 2,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  posUpperLeftSlash: {
    top: 90,
    left: 35,
  },
  slashPurple: {
    width: 36,
    height: 2.5,
    backgroundColor: '#818CF8',
    transform: [{ rotate: '-35deg' }],
    borderRadius: 1,
  },
  posUpperRightSquiggle: {
    top: 85,
    right: 36,
    transform: [{ rotate: '-15deg' }],
  },
  posMidLeftSquare: {
    top: 165,
    left: 28,
  },
  squareCyan: {
    width: 14,
    height: 14,
    borderColor: '#22D3EE',
    borderWidth: 2,
    borderRadius: 3.5,
    transform: [{ rotate: '20deg' }],
  },
  posMidRightTriangle: {
    top: 155,
    right: 30,
  },
  trianglePurple: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A855F7',
    transform: [{ rotate: '70deg' }],
  },
  posLowerLeftDot: {
    bottom: 25,
    left: 55,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  posLowerCenterRing: {
    bottom: 18,
    left: '47%',
  },
  ringYellow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  posLowerRightSquiggle: {
    bottom: 25,
    right: 55,
    transform: [{ rotate: '15deg' }],
  },
  posBottomRightTriangle: {
    bottom: 55,
    right: 25,
  },
  triangleSoftPurple: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#C084FC',
    transform: [{ rotate: '-25deg' }],
  },

  /* ──────── Middle Content Section ──────── */
  contentArea: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headlineText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 8,
    width: '100%',
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
    paddingHorizontal: 16,
  },

  /* ──────── Bottom Solid Black Button Section ──────── */
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    width: '100%',
  },
  getStartedButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#000000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
