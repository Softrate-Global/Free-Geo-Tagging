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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
          {/* ──────── LOCATION, GPS, MAP, ROAD & LANDMARK ICONS FLOATING NEAR CAMERA ──────── */}
          {/* 1. Top Left - Location Marker */}
          <View style={[styles.floatingItem, styles.posTopLeftLocation]}>
            <Ionicons name="location" size={22} color="#000000" />
          </View>

          {/* 2. Top Inner-Left - Satellite GPS */}
          <View style={[styles.floatingItem, styles.posTopInnerLeftSatellite]}>
            <MaterialCommunityIcons name="satellite-variant" size={20} color="#000000" />
          </View>

          {/* 3. Top Center - Compass */}
          <View style={[styles.floatingItem, styles.posTopCenterCompass]}>
            <Ionicons name="compass-outline" size={23} color="#000000" />
          </View>

          {/* 4. Top Inner-Right - Route / Road Path */}
          <View style={[styles.floatingItem, styles.posTopInnerRightRoute]}>
            <MaterialCommunityIcons name="routes" size={21} color="#000000" />
          </View>

          {/* 5. Top Right - Folded Map */}
          <View style={[styles.floatingItem, styles.posTopRightMap]}>
            <Ionicons name="map-outline" size={22} color="#000000" />
          </View>

          {/* 6. Upper-Left - Globe / Earth */}
          <View style={[styles.floatingItem, styles.posUpperLeftGlobe]}>
            <Ionicons name="globe-outline" size={21} color="#000000" />
          </View>

          {/* 7. Mid-Left - GPS Crosshair / Target */}
          <View style={[styles.floatingItem, styles.posMidLeftCrosshair]}>
            <MaterialCommunityIcons name="crosshairs-gps" size={21} color="#000000" />
          </View>

          {/* 8. Lower-Left - Highway / Road */}
          <View style={[styles.floatingItem, styles.posLowerLeftRoad]}>
            <MaterialCommunityIcons name="road-variant" size={22} color="#000000" />
          </View>

          {/* 9. Upper-Right - Road Signpost */}
          <View style={[styles.floatingItem, styles.posUpperRightSignpost]}>
            <Ionicons name="trail-sign-outline" size={21} color="#000000" />
          </View>

          {/* 10. Mid-Right - GPS Navigation Arrow */}
          <View style={[styles.floatingItem, styles.posMidRightNavigate]}>
            <Ionicons name="navigate" size={20} color="#000000" />
          </View>

          {/* 11. Lower-Right - Landmark / Building */}
          <View style={[styles.floatingItem, styles.posLowerRightLandmark]}>
            <Ionicons name="business-outline" size={22} color="#000000" />
          </View>

          {/* 12. Bottom Left - Map Pin */}
          <View style={[styles.floatingItem, styles.posBottomLeftPin]}>
            <Ionicons name="pin" size={21} color="#000000" />
          </View>

          {/* 13. Bottom Inner-Left - Destination Flag */}
          <View style={[styles.floatingItem, styles.posBottomInnerLeftFlag]}>
            <Ionicons name="flag" size={20} color="#000000" />
          </View>

          {/* 14. Bottom Center - Direction Navigate Circle */}
          <View style={[styles.floatingItem, styles.posBottomCenterNavigate]}>
            <Ionicons name="navigate-circle-outline" size={23} color="#000000" />
          </View>

          {/* 15. Bottom Inner-Right - City Skyline Landmark */}
          <View style={[styles.floatingItem, styles.posBottomInnerRightCity]}>
            <MaterialCommunityIcons name="city-variant-outline" size={21} color="#000000" />
          </View>

          {/* 16. Bottom Right - GPS Radar Marker */}
          <View style={[styles.floatingItem, styles.posBottomRightRadar]}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={23} color="#000000" />
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

  /* ──────── Geo, Map, GPS, Road & Landmark Floating Icons ──────── */
  floatingItem: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posTopLeftLocation: {
    top: 8,
    left: 22,
    transform: [{ rotate: '12deg' }],
  },
  posTopInnerLeftSatellite: {
    top: 26,
    left: 70,
    transform: [{ rotate: '-18deg' }],
  },
  posTopCenterCompass: {
    top: 4,
    left: '47%',
    transform: [{ rotate: '10deg' }],
  },
  posTopInnerRightRoute: {
    top: 24,
    right: 68,
    transform: [{ rotate: '-15deg' }],
  },
  posTopRightMap: {
    top: 8,
    right: 20,
    transform: [{ rotate: '-10deg' }],
  },
  posUpperLeftGlobe: {
    top: 52,
    left: 16,
    transform: [{ rotate: '-8deg' }],
  },
  posMidLeftCrosshair: {
    top: 96,
    left: 8,
    transform: [{ rotate: '15deg' }],
  },
  posLowerLeftRoad: {
    top: 140,
    left: 18,
    transform: [{ rotate: '20deg' }],
  },
  posUpperRightSignpost: {
    top: 50,
    right: 18,
    transform: [{ rotate: '12deg' }],
  },
  posMidRightNavigate: {
    top: 94,
    right: 10,
    transform: [{ rotate: '25deg' }],
  },
  posLowerRightLandmark: {
    top: 138,
    right: 18,
    transform: [{ rotate: '-12deg' }],
  },
  posBottomLeftPin: {
    bottom: 14,
    left: 24,
    transform: [{ rotate: '18deg' }],
  },
  posBottomInnerLeftFlag: {
    bottom: 8,
    left: 74,
    transform: [{ rotate: '-12deg' }],
  },
  posBottomCenterNavigate: {
    bottom: 4,
    left: '47%',
    transform: [{ rotate: '8deg' }],
  },
  posBottomInnerRightCity: {
    bottom: 10,
    right: 70,
    transform: [{ rotate: '10deg' }],
  },
  posBottomRightRadar: {
    bottom: 14,
    right: 22,
    transform: [{ rotate: '-16deg' }],
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
