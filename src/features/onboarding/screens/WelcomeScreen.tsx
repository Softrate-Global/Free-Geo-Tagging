import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      {/* ──────── TOP DECORATIVE & SKELETON CAMERA SECTION ──────── */}
      <View style={styles.illustrationArea}>
        {/* Floating Festive Confetti Shapes matching reference */}
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

        {/* 4. Upper Right Cyan Squiggle */}
        <View style={[styles.floatingItem, styles.posUpperRightSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#06B6D4' }]}>~</Text>
        </View>

        {/* 5. Mid Left Cyan Hollow Square */}
        <View style={[styles.floatingItem, styles.posMidLeftSquare]}>
          <View style={styles.squareCyan} />
        </View>

        {/* 6. Lower Left Green Dot */}
        <View style={[styles.floatingItem, styles.posLowerLeftDot]}>
          <View style={styles.dotGreen} />
        </View>

        {/* 7. Center Left Purple Slash */}
        <View style={[styles.floatingItem, styles.posCenterLeftSlash]}>
          <View style={styles.slashPurple} />
        </View>

        {/* 8. Top Near-Camera Purple Triangle */}
        <View style={[styles.floatingItem, styles.posNearPurpleTriangle]}>
          <View style={styles.trianglePurple} />
        </View>

        {/* 9. Lower Near-Camera Yellow Ring */}
        <View style={[styles.floatingItem, styles.posNearYellowRing]}>
          <View style={styles.ringYellow} />
        </View>

        {/* 10. Right Near-Camera Cyan Squiggle */}
        <View style={[styles.floatingItem, styles.posNearCyanSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#22D3EE' }]}>~</Text>
        </View>

        {/* 11. Lower Right Purple Triangle */}
        <View style={[styles.floatingItem, styles.posLowerRightTriangle]}>
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
        {/* Primary Headline with Current App Name */}
        <Text style={styles.headlineText}>Welcome To Free Geo Tagging</Text>

        {/* Supporting Description with Current App Name */}
        <Text style={styles.descriptionText}>
          Please turn on your GPS so that Free Geo Tagging can accurately geotag your photographs with your exact building, company, and location details.
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
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },

  /* ──────── Skeleton / Line-Art Camera Icon (No Background Blob) ──────── */
  skeletonCameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 130,
    height: 88,
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: 3.5,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flashWindow: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  lensRingOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3.5,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensRingInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.2,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensPupil: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    position: 'relative',
  },
  lensReflection: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },

  /* ──────── Floating Decorative Elements ──────── */
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
    top: 30,
    left: 45,
    transform: [{ rotate: '25deg' }],
  },
  posTopCenterTriangle: {
    top: 65,
    left: '38%',
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
    top: 25,
    right: 50,
  },
  diamondGreen: {
    width: 13,
    height: 13,
    borderColor: '#86EFAC',
    borderWidth: 2,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  posUpperRightSquiggle: {
    top: 105,
    right: 60,
    transform: [{ rotate: '-15deg' }],
  },
  posMidLeftSquare: {
    top: 160,
    left: 40,
  },
  squareCyan: {
    width: 14,
    height: 14,
    borderColor: '#22D3EE',
    borderWidth: 2,
    borderRadius: 3.5,
    transform: [{ rotate: '20deg' }],
  },
  posLowerLeftDot: {
    bottom: 35,
    left: 48,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  posCenterLeftSlash: {
    top: 135,
    left: 85,
  },
  slashPurple: {
    width: 38,
    height: 2.5,
    backgroundColor: '#818CF8',
    transform: [{ rotate: '-35deg' }],
    borderRadius: 1,
  },
  posNearPurpleTriangle: {
    top: 110,
    left: '34%',
  },
  trianglePurple: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A855F7',
    transform: [{ rotate: '70deg' }],
  },
  posNearYellowRing: {
    bottom: 50,
    left: '39%',
  },
  ringYellow: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  posNearCyanSquiggle: {
    bottom: 65,
    right: 75,
    transform: [{ rotate: '15deg' }],
  },
  posLowerRightTriangle: {
    bottom: 45,
    right: 45,
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
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  headlineText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  descriptionText: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22.5,
    letterSpacing: 0.1,
    paddingHorizontal: 4,
  },

  /* ──────── Bottom Solid Black Button Section ──────── */
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
