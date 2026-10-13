import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
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
      {/* ──────── TOP DECORATIVE & ILLUSTRATION SECTION ──────── */}
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

        {/* 8. Inside Blob Purple Triangle */}
        <View style={[styles.floatingItem, styles.posInsidePurpleTriangle]}>
          <View style={styles.trianglePurple} />
        </View>

        {/* 9. Inside Blob Yellow Ring */}
        <View style={[styles.floatingItem, styles.posInsideYellowRing]}>
          <View style={styles.ringYellow} />
        </View>

        {/* 10. Inside Blob Cyan Squiggle */}
        <View style={[styles.floatingItem, styles.posInsideCyanSquiggle]}>
          <Text style={[styles.squiggleText, { color: '#22D3EE' }]}>~</Text>
        </View>

        {/* 11. Lower Right Purple Triangle */}
        <View style={[styles.floatingItem, styles.posLowerRightTriangle]}>
          <View style={styles.triangleSoftPurple} />
        </View>

        {/* ──────── CENTER BLACK ORGANIC BLOB (ICON BACKGROUND) ──────── */}
        <View style={styles.iconBlobBackground}>
          {/* Inner Accent Halo */}
          <View style={styles.innerHalo}>
            {/* ──────── BLACK CAMERA ICON WITH CRISP CONTRAST ──────── */}
            <View style={styles.cameraIconContainer}>
              {/* Top Shutter Button */}
              <View style={styles.cameraShutterBump} />

              {/* Main Camera Body (Deep Black) */}
              <View style={styles.cameraBody}>
                {/* Top Right Flash Window */}
                <View style={styles.cameraFlash} />

                {/* Concentric Center Camera Lens */}
                <View style={styles.cameraLensOuter}>
                  <View style={styles.cameraLensMid}>
                    <View style={styles.cameraLensCenter}>
                      {/* Lens Glass Reflection Dot */}
                      <View style={styles.cameraLensReflection} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ──────── MIDDLE CONTENT SECTION ──────── */}
      <View style={styles.contentArea}>
        {/* Primary Headline */}
        <Text style={styles.headlineText}>Welcome To Camshare</Text>

        {/* Supporting Description */}
        <Text style={styles.descriptionText}>
          Please turn on your GPS so that we can accurately geotag your photographs with your exact building, company, and location details.
        </Text>

        {/* Pagination Indicator Dots */}
        <View style={styles.paginationRow}>
          <View style={styles.dotInactive} />
          <View style={styles.dotActive} />
          <View style={styles.dotInactive} />
        </View>
      </View>

      {/* ──────── BOTTOM BLACK BUTTON SECTION ──────── */}
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
    flex: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },

  /* ──────── Center Icon Background Blob (Solid Black) ──────── */
  iconBlobBackground: {
    width: 220,
    height: 195,
    backgroundColor: '#000000',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 95,
    borderBottomLeftRadius: 105,
    borderBottomRightRadius: 115,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  innerHalo: {
    width: 200,
    height: 175,
    borderRadius: 90,
    backgroundColor: '#0A0A0A',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ──────── Black Camera Icon Styling ──────── */
  cameraIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraShutterBump: {
    width: 20,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginRight: 40,
    marginBottom: -1,
  },
  cameraBody: {
    width: 106,
    height: 72,
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2.8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraFlash: {
    position: 'absolute',
    top: 9,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
  },
  cameraLensOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLensMid: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#262626',
    borderWidth: 1.5,
    borderColor: '#525252',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLensCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    position: 'relative',
  },
  cameraLensReflection: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
    top: 35,
    left: 45,
    transform: [{ rotate: '25deg' }],
  },
  posTopCenterTriangle: {
    top: 85,
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
    top: 30,
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
    top: 130,
    right: 70,
    transform: [{ rotate: '-15deg' }],
  },
  posMidLeftSquare: {
    top: 200,
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
    bottom: 50,
    left: 48,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  posCenterLeftSlash: {
    top: 175,
    left: 95,
  },
  slashPurple: {
    width: 38,
    height: 2.5,
    backgroundColor: '#818CF8',
    transform: [{ rotate: '-35deg' }],
    borderRadius: 1,
  },
  posInsidePurpleTriangle: {
    top: 145,
    left: 145,
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
  posInsideYellowRing: {
    bottom: 95,
    left: 155,
  },
  ringYellow: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  posInsideCyanSquiggle: {
    bottom: 100,
    right: 90,
    transform: [{ rotate: '15deg' }],
  },
  posLowerRightTriangle: {
    bottom: 60,
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
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  headlineText: {
    fontSize: 25,
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
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },

  /* ──────── Bottom Black Button Section ──────── */
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
