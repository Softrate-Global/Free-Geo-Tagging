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
import { APP_CONSTANTS } from '../../../core/constants/appConstants';

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

      // Persist onboarding state to local storage
      await AsyncStorage.setItem(APP_CONSTANTS.ONBOARDING_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');

      // Navigate to camera viewfinder and reset stack history
      navigation.reset({
        index: 0,
        routes: [{ name: 'Camera' }],
      });
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
        {/* Memphis Confetti Framed Illustration Box */}
        <View style={styles.illustrationBox}>
          {/* ──────── MEMPHIS STYLE PARTY PAPERS (MATCHING REFERENCE DESIGN) ──────── */}
          {/* 1. Upper-Left Big Coral Hook Noodle */}
          <View style={[styles.floatingItem, styles.posNoodleCoralUpperLeft]}>
            <View style={styles.noodleCoralHook} />
          </View>

          {/* 2. Solid Orange Square (above coral noodle) */}
          <View style={[styles.floatingItem, styles.posSquareOrangeUpperLeft]}>
            <View style={styles.squareOrange} />
          </View>

          {/* 3. Solid Yellow Dot (Top-Left) */}
          <View style={[styles.floatingItem, styles.posDotYellowTopLeft]}>
            <View style={styles.dotYellow} />
          </View>

          {/* 4. Solid Red Square (Far Top-Left) */}
          <View style={[styles.floatingItem, styles.posSquareRedTopFarLeft]}>
            <View style={styles.squareRedSmall} />
          </View>

          {/* 5. Top Green Curved Noodle */}
          <View style={[styles.floatingItem, styles.posNoodleGreenTop]}>
            <View style={styles.noodleGreen} />
          </View>

          {/* 6. Solid Sky Blue Diamond (near green noodle) */}
          <View style={[styles.floatingItem, styles.posDiamondBlueTop]}>
            <View style={styles.diamondBlue} />
          </View>

          {/* 7. Small Solid Yellow Triangle (Top) */}
          <View style={[styles.floatingItem, styles.posTriangleYellowTop]}>
            <View style={styles.triangleYellowMini} />
          </View>

          {/* 8. Solid Coral Triangle Pointing Down (Top-Mid) */}
          <View style={[styles.floatingItem, styles.posTriangleCoralTop]}>
            <View style={styles.triangleCoralMini} />
          </View>

          {/* 9. Solid Red Dot (Top-Right) */}
          <View style={[styles.floatingItem, styles.posDotRedTopRight]}>
            <View style={styles.dotRed} />
          </View>

          {/* 10. Solid Blue Triangle (Top-Right) */}
          <View style={[styles.floatingItem, styles.posTriangleBlueTopRight]}>
            <View style={styles.triangleBlueMini} />
          </View>

          {/* 11. Mid-Right Big Yellow/Orange Arc */}
          <View style={[styles.floatingItem, styles.posArcYellowRight]}>
            <View style={styles.arcYellow} />
          </View>

          {/* 12. Solid Red Square (beside yellow arc) */}
          <View style={[styles.floatingItem, styles.posSquareRedRight]}>
            <View style={styles.squareRed} />
          </View>

          {/* 13. Solid Green Dot (Mid-Right) */}
          <View style={[styles.floatingItem, styles.posDotGreenRight]}>
            <View style={styles.dotGreen} />
          </View>

          {/* 14. Solid Green Triangle (Mid-Right) */}
          <View style={[styles.floatingItem, styles.posTriangleGreenRight]}>
            <View style={styles.triangleGreenMini} />
          </View>

          {/* 15. Solid Coral Triangle (Far-Right) */}
          <View style={[styles.floatingItem, styles.posTriangleCoralFarRight]}>
            <View style={styles.triangleCoralSide} />
          </View>

          {/* 16. Solid Blue Oval / Dot (Mid-Left) */}
          <View style={[styles.floatingItem, styles.posDotBlueMidLeft]}>
            <View style={styles.dotBlue} />
          </View>

          {/* 17. Solid Blue Triangle Pointing Down (Mid-Left) */}
          <View style={[styles.floatingItem, styles.posTriangleBlueMidLeft]}>
            <View style={styles.triangleBlueDown} />
          </View>

          {/* 18. Solid Red Pill / Oval (Lower-Mid Left) */}
          <View style={[styles.floatingItem, styles.posDotRedLowerMid]}>
            <View style={styles.pillRed} />
          </View>

          {/* 19. Green Curved Noodle (Bottom-Left) */}
          <View style={[styles.floatingItem, styles.posNoodleGreenBottom]}>
            <View style={styles.noodleGreenTail} />
          </View>

          {/* 20. Solid Blue Dot (Bottom Center) */}
          <View style={[styles.floatingItem, styles.posDotBlueBottomCenter]}>
            <View style={styles.dotBlueSmall} />
          </View>

          {/* 21. Solid Teal Square + Slash (Bottom Center) */}
          <View style={[styles.floatingItem, styles.posGroupTealSquareBottom]}>
            <View style={styles.squareTeal} />
            <View style={styles.slashBlueDiagonal} />
          </View>

          {/* 22. Coral 'J' Hook Noodle (Bottom-Right) */}
          <View style={[styles.floatingItem, styles.posNoodleCoralHookBottom]}>
            <View style={styles.noodleCoralJ} />
          </View>

          {/* 23. Solid Yellow Triangle (Bottom-Right) */}
          <View style={[styles.floatingItem, styles.posTriangleYellowBottom]}>
            <View style={styles.triangleYellowMini} />
          </View>

          {/* 24. Solid Green Bar + Blue Dot (Far Bottom-Right) */}
          <View style={[styles.floatingItem, styles.posGroupGreenBarBottomRight]}>
            <View style={styles.barGreen} />
            <View style={styles.dotBlueSmall} />
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

  /* ──────── Memphis Confetti Illustration Box ──────── */
  illustrationBox: {
    width: 320,
    height: 240,
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

  /* ──────── Memphis Style Party Papers (Reduced Soft Palette) ──────── */
  floatingItem: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72,
  },

  /* Memphis Shapes - Harmonious 3-Color Palette (Soft Coral, Soft Amber, Soft Sky Blue) */
  noodleCoralHook: {
    width: 28,
    height: 42,
    borderTopWidth: 4.5,
    borderLeftWidth: 4.5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderColor: '#F87171',
    transform: [{ rotate: '20deg' }],
  },
  squareOrange: {
    width: 14,
    height: 14,
    backgroundColor: '#FBBF24',
    borderRadius: 2.5,
    transform: [{ rotate: '12deg' }],
  },
  dotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FBBF24',
  },
  squareRedSmall: {
    width: 11,
    height: 11,
    backgroundColor: '#F87171',
    borderRadius: 2,
  },
  noodleGreen: {
    width: 44,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
    borderColor: '#60A5FA',
    transform: [{ rotate: '-18deg' }],
  },
  diamondBlue: {
    width: 10,
    height: 10,
    backgroundColor: '#60A5FA',
    transform: [{ rotate: '45deg' }],
  },
  triangleYellowMini: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FBBF24',
  },
  triangleCoralMini: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F87171',
  },
  dotRed: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F87171',
  },
  triangleBlueMini: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#60A5FA',
    transform: [{ rotate: '25deg' }],
  },
  arcYellow: {
    width: 36,
    height: 46,
    borderTopWidth: 4.5,
    borderRightWidth: 4.5,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderColor: '#FBBF24',
    transform: [{ rotate: '18deg' }],
  },
  squareRed: {
    width: 13,
    height: 13,
    backgroundColor: '#F87171',
    borderRadius: 2.5,
    transform: [{ rotate: '15deg' }],
  },
  dotGreen: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#60A5FA',
  },
  triangleGreenMini: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#60A5FA',
    transform: [{ rotate: '45deg' }],
  },
  triangleCoralSide: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F87171',
    transform: [{ rotate: '45deg' }],
  },
  dotBlue: {
    width: 12,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#60A5FA',
  },
  triangleBlueDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#60A5FA',
    transform: [{ rotate: '20deg' }],
  },
  pillRed: {
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
    transform: [{ rotate: '-12deg' }],
  },
  noodleGreenTail: {
    width: 32,
    height: 48,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderColor: '#60A5FA',
    transform: [{ rotate: '24deg' }],
  },
  dotBlueSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60A5FA',
  },
  squareTeal: {
    width: 13,
    height: 13,
    backgroundColor: '#60A5FA',
    borderRadius: 2.5,
  },
  slashBlueDiagonal: {
    width: 15,
    height: 3,
    backgroundColor: '#F87171',
    borderRadius: 1.5,
    transform: [{ rotate: '55deg' }],
    marginTop: -2,
    marginLeft: 8,
  },
  noodleCoralJ: {
    width: 26,
    height: 38,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
    borderColor: '#F87171',
    transform: [{ rotate: '14deg' }],
  },
  barGreen: {
    width: 15,
    height: 7,
    backgroundColor: '#FBBF24',
    borderRadius: 2,
    transform: [{ rotate: '-30deg' }],
  },

  /* Positions */
  posNoodleCoralUpperLeft: {
    top: 40,
    left: 24,
  },
  posSquareOrangeUpperLeft: {
    top: 22,
    left: 26,
  },
  posDotYellowTopLeft: {
    top: 6,
    left: 68,
  },
  posSquareRedTopFarLeft: {
    top: 4,
    left: 14,
  },
  posNoodleGreenTop: {
    top: 12,
    left: 104,
  },
  posDiamondBlueTop: {
    top: 26,
    left: 146,
  },
  posTriangleYellowTop: {
    top: 28,
    left: 100,
  },
  posTriangleCoralTop: {
    top: 14,
    right: 110,
  },
  posDotRedTopRight: {
    top: 4,
    right: 86,
  },
  posTriangleBlueTopRight: {
    top: 10,
    right: 44,
  },
  posArcYellowRight: {
    top: 32,
    right: 28,
  },
  posSquareRedRight: {
    top: 58,
    right: 14,
  },
  posDotGreenRight: {
    top: 60,
    right: 78,
  },
  posTriangleGreenRight: {
    top: 72,
    right: 62,
  },
  posTriangleCoralFarRight: {
    top: 116,
    right: 10,
  },
  posDotBlueMidLeft: {
    top: 88,
    left: 18,
  },
  posTriangleBlueMidLeft: {
    top: 126,
    left: 20,
  },
  posDotRedLowerMid: {
    top: 130,
    left: 44,
  },
  posNoodleGreenBottom: {
    bottom: 8,
    left: 52,
  },
  posDotBlueBottomCenter: {
    bottom: 32,
    left: 112,
  },
  posGroupTealSquareBottom: {
    bottom: 12,
    left: 128,
  },
  posNoodleCoralHookBottom: {
    bottom: 8,
    right: 68,
  },
  posTriangleYellowBottom: {
    bottom: 26,
    right: 90,
  },
  posGroupGreenBarBottomRight: {
    bottom: 14,
    right: 26,
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
