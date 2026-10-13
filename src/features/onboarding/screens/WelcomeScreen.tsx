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

      {/* ──────── UNIFIED CENTER GROUP (ILLUSTRATION + TEXT) ──────── */}
      <View style={styles.centerGroup}>
        {/* Compact, tightly-framed illustration box */}
        <View style={styles.illustrationBox}>
          {/* Confetti pieces closely framing the camera */}
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

          {/* 4. Mid Left Purple Slash */}
          <View style={[styles.floatingItem, styles.posMidLeftSlash]}>
            <View style={styles.slashPurple} />
          </View>

          {/* 5. Mid Right Cyan Squiggle */}
          <View style={[styles.floatingItem, styles.posMidRightSquiggle]}>
            <Text style={[styles.squiggleText, { color: '#06B6D4' }]}>~</Text>
          </View>

          {/* 6. Lower Left Cyan Hollow Square */}
          <View style={[styles.floatingItem, styles.posLowerLeftSquare]}>
            <View style={styles.squareCyan} />
          </View>

          {/* 7. Lower Center Yellow Ring */}
          <View style={[styles.floatingItem, styles.posLowerCenterRing]}>
            <View style={styles.ringYellow} />
          </View>

          {/* 8. Lower Right Green Dot */}
          <View style={[styles.floatingItem, styles.posLowerRightDot]}>
            <View style={styles.dotGreen} />
          </View>

          {/* 9. Bottom Right Purple Triangle */}
          <View style={[styles.floatingItem, styles.posBottomRightTriangle]}>
            <View style={styles.triangleSoftPurple} />
          </View>

          {/* 10. Top Inner Left Coral Dot (Near Shutter) */}
          <View style={[styles.floatingItem, styles.posTopInnerLeftCoralDot]}>
            <View style={styles.dotCoral} />
          </View>

          {/* 11. Top Inner Right Indigo Slash */}
          <View style={[styles.floatingItem, styles.posTopInnerRightIndigoSlash]}>
            <View style={styles.slashIndigo} />
          </View>

          {/* 12. Upper Left Orange Diamond */}
          <View style={[styles.floatingItem, styles.posUpperLeftOrangeDiamond]}>
            <View style={styles.diamondOrange} />
          </View>

          {/* 13. Upper Right Rose Squiggle */}
          <View style={[styles.floatingItem, styles.posUpperRightRoseSquiggle]}>
            <Text style={[styles.squiggleText, { color: '#FB7185', fontSize: 20 }]}>~</Text>
          </View>

          {/* 14. Camera Top-Right Mint Dot */}
          <View style={[styles.floatingItem, styles.posCameraTopRightMintDot]}>
            <View style={styles.dotMint} />
          </View>

          {/* 15. Camera Left Teal Ribbon */}
          <View style={[styles.floatingItem, styles.posCameraLeftTealRibbon]}>
            <View style={styles.ribbonTeal} />
          </View>

          {/* 16. Camera Right Violet Square */}
          <View style={[styles.floatingItem, styles.posCameraRightVioletSquare]}>
            <View style={styles.squareViolet} />
          </View>

          {/* 17. Lower Left Sky Blue Ring */}
          <View style={[styles.floatingItem, styles.posLowerLeftBlueRing]}>
            <View style={styles.ringBlue} />
          </View>

          {/* 18. Lower Right Emerald Slash */}
          <View style={[styles.floatingItem, styles.posLowerRightEmeraldSlash]}>
            <View style={styles.slashEmerald} />
          </View>

          {/* 19. Bottom Left Pink Dot */}
          <View style={[styles.floatingItem, styles.posBottomLeftPinkDot]}>
            <View style={styles.dotPink} />
          </View>

          {/* 20. Bottom Mid Amber Triangle */}
          <View style={[styles.floatingItem, styles.posBottomMidAmberTriangle]}>
            <View style={styles.triangleAmber} />
          </View>

          {/* ──────── BLACK SKELETON CAMERA ICON ──────── */}
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

        {/* ──────── CONTENT SECTION (CLOSE TO ILLUSTRATION) ──────── */}
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

          {/* Short, complete 2-line description without truncation */}
          <Text style={styles.descriptionText}>
            Turn on GPS so Free Geo Tagging can accurately geotag your photos with company and address details.
          </Text>
        </View>
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

  /* ──────── Center Group: Keeps Illustration & Text Harmoniously Unified ──────── */
  centerGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -15,
  },

  /* ──────── Compact Hero Illustration Box Eliminates Giant White Canyon ──────── */
  illustrationBox: {
    width: 310,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  /* ──────── Black Skeleton / Line-Art Camera Icon ──────── */
  skeletonCameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  shutterTab: {
    width: 32,
    height: 8,
    backgroundColor: '#000000',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginRight: 64,
    marginBottom: -1,
  },
  skeletonCameraBody: {
    width: 168,
    height: 114,
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: 3.8,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flashWindow: {
    position: 'absolute',
    top: 15,
    right: 18,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  lensRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3.8,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensRingInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensPupil: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    position: 'relative',
  },
  lensReflection: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },

  /* ──────── Closely & Elegantly Framed Confetti Elements ──────── */
  floatingItem: {
    position: 'absolute',
    zIndex: 2,
  },
  squiggleText: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 26,
  },
  posTopLeftSquiggle: {
    top: 10,
    left: 20,
    transform: [{ rotate: '25deg' }],
  },
  posTopCenterTriangle: {
    top: 6,
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
    top: 12,
    right: 22,
  },
  diamondGreen: {
    width: 13,
    height: 13,
    borderColor: '#86EFAC',
    borderWidth: 2,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  posMidLeftSlash: {
    top: 92,
    left: 10,
  },
  slashPurple: {
    width: 34,
    height: 2.5,
    backgroundColor: '#818CF8',
    transform: [{ rotate: '-35deg' }],
    borderRadius: 1,
  },
  posMidRightSquiggle: {
    top: 88,
    right: 14,
    transform: [{ rotate: '-15deg' }],
  },
  posLowerLeftSquare: {
    bottom: 18,
    left: 18,
  },
  squareCyan: {
    width: 13,
    height: 13,
    borderColor: '#22D3EE',
    borderWidth: 2,
    borderRadius: 3.5,
    transform: [{ rotate: '20deg' }],
  },
  posLowerCenterRing: {
    bottom: 8,
    left: '48%',
  },
  ringYellow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  posLowerRightDot: {
    bottom: 20,
    right: 22,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  posBottomRightTriangle: {
    bottom: 8,
    right: 68,
  },
  triangleSoftPurple: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#C084FC',
    transform: [{ rotate: '-25deg' }],
  },

  /* ──────── Additional Party Papers Near Camera Icon ──────── */
  posTopInnerLeftCoralDot: {
    top: 32,
    left: 68,
  },
  dotCoral: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FB923C',
  },
  posTopInnerRightIndigoSlash: {
    top: 30,
    right: 65,
  },
  slashIndigo: {
    width: 22,
    height: 2.5,
    backgroundColor: '#6366F1',
    transform: [{ rotate: '40deg' }],
    borderRadius: 1,
  },
  posUpperLeftOrangeDiamond: {
    top: 48,
    left: 32,
  },
  diamondOrange: {
    width: 10,
    height: 10,
    borderColor: '#F97316',
    borderWidth: 2,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  posUpperRightRoseSquiggle: {
    top: 45,
    right: 34,
    transform: [{ rotate: '30deg' }],
  },
  posCameraTopRightMintDot: {
    top: 34,
    right: 108,
  },
  dotMint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  posCameraLeftTealRibbon: {
    top: 130,
    left: 20,
  },
  ribbonTeal: {
    width: 20,
    height: 2.5,
    backgroundColor: '#14B8A6',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
  },
  posCameraRightVioletSquare: {
    top: 132,
    right: 22,
  },
  squareViolet: {
    width: 11,
    height: 11,
    borderColor: '#A855F7',
    borderWidth: 2,
    borderRadius: 2.5,
    transform: [{ rotate: '15deg' }],
  },
  posLowerLeftBlueRing: {
    bottom: 48,
    left: 36,
  },
  ringBlue: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderColor: '#38BDF8',
    borderWidth: 2,
  },
  posLowerRightEmeraldSlash: {
    bottom: 46,
    right: 40,
  },
  slashEmerald: {
    width: 22,
    height: 2.5,
    backgroundColor: '#10B981',
    transform: [{ rotate: '-30deg' }],
    borderRadius: 1,
  },
  posBottomLeftPinkDot: {
    bottom: 14,
    left: 62,
  },
  dotPink: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EC4899',
  },
  posBottomMidAmberTriangle: {
    bottom: 12,
    left: '32%',
  },
  triangleAmber: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
    transform: [{ rotate: '15deg' }],
  },

  /* ──────── Middle Content Section ──────── */
  contentArea: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 26,
    width: '100%',
  },
  headlineText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 10,
    width: '100%',
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: 0.1,
    paddingHorizontal: 10,
  },

  /* ──────── Bottom Solid Black Button Section ──────── */
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 70,
    width: '100%',
  },
  getStartedButton: {
    width: '100%',
    height: 56,
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
