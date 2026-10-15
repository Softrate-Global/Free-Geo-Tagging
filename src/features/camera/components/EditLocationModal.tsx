import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing, borderRadius } from '../../../core/theme/spacing';
import { LocationService } from '../../location/services/locationService';

interface EditLocationModalProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  initialPlaceName: string;
  initialSubAddress: string;
  initialFormattedAddress: string;
  onSave: (data: { placeName: string; subAddress: string; formattedAddress: string }) => void;
  onReset: () => void;
  onClose: () => void;
}

export const EditLocationModal = React.memo<EditLocationModalProps>(({
  visible,
  latitude,
  longitude,
  initialPlaceName,
  initialSubAddress,
  initialFormattedAddress,
  onSave,
  onReset,
  onClose,
}) => {
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const [formattedAddress, setFormattedAddress] = useState(initialFormattedAddress);
  const [subAddress, setSubAddress] = useState(initialSubAddress);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const fetchRealAddress = async (lat: number, lon: number) => {
    if (!lat || !lon) return;
    setIsFetchingAddress(true);
    try {
      const geo = await LocationService.reverseGeocode(lat, lon);
      if (geo) {
        if (!placeName || placeName === 'GPS LOCATION') {
          setPlaceName(geo.placeName || '');
        }
        setFormattedAddress(geo.formattedAddress || '');
        setSubAddress(geo.subAddress || '');
      }
    } catch (e) {
      console.warn('Failed to auto-detect live address:', e);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setPlaceName(initialPlaceName || '');
      setFormattedAddress(initialFormattedAddress || '');
      setSubAddress(initialSubAddress || '');

      // If initialFormattedAddress is missing or empty, immediately auto-detect the real address of this place!
      if (!initialFormattedAddress && latitude && longitude) {
        fetchRealAddress(latitude, longitude);
      }
    }
  }, [visible, initialPlaceName, initialSubAddress, initialFormattedAddress, latitude, longitude]);

  const handleSave = () => {
    const finalPlace = placeName.trim() || 'GPS LOCATION';
    const finalSub = subAddress.trim();
    const finalAddr = formattedAddress.trim() || finalPlace;

    onSave({
      placeName: finalPlace,
      subAddress: finalSub,
      formattedAddress: finalAddr,
    });
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>CUSTOMIZE PLACE & ADDRESS</Text>
            <Text style={styles.subtitle}>
              Current GPS: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°. Edit or auto-detect the exact name and address for these coordinates.
            </Text>

            {/* Quick Auto-Detect Live Address Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.detectBtn}
              onPress={() => fetchRealAddress(latitude, longitude)}
              disabled={isFetchingAddress}
            >
              {isFetchingAddress ? (
                <View style={styles.detectBtnContent}>
                  <ActivityIndicator size="small" color="#FFD700" style={{ marginRight: 6 }} />
                  <Text style={styles.detectBtnText}>FETCHING REAL ADDRESS OF THIS PLACE...</Text>
                </View>
              ) : (
                <Text style={styles.detectBtnText}>📍 AUTO-DETECT REAL GPS ADDRESS OF THIS PLACE</Text>
              )}
            </TouchableOpacity>

            {/* Field 1: Company / Building / Apartment Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>COMPANY / BUILDING / APARTMENT NAME</Text>
              <TextInput
                style={styles.input}
                value={placeName}
                onChangeText={setPlaceName}
                placeholder={isFetchingAddress ? 'Detecting place name...' : 'e.g. WORKPLACE / APARTMENT'}
                placeholderTextColor="#666666"
                autoCapitalize="characters"
              />
            </View>

            {/* Field 2: Full Detailed Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ACCURATE ADDRESS (STREET, DOOR NO, AREA)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formattedAddress}
                onChangeText={setFormattedAddress}
                placeholder={isFetchingAddress ? 'Detecting real address...' : 'e.g. Door No, Street Name, Area, City - Pincode'}
                placeholderTextColor="#666666"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Field 3: Subtitle / City Area */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SUB-ADDRESS / REGION (SHOWN BELOW TITLE)</Text>
              <TextInput
                style={styles.input}
                value={subAddress}
                onChangeText={setSubAddress}
                placeholder={isFetchingAddress ? 'Detecting sub-address...' : 'e.g. Area, City or District, State'}
                placeholderTextColor="#666666"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonStack}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.btn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>SAVE & REMEMBER LOCATION</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.btn, styles.resetBtn]}
                onPress={handleReset}
              >
                <Text style={styles.resetBtnText}>RESET TO AUTO GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#121212',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: '#A1A1A6',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  detectBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  detectBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectBtnText: {
    ...typography.captionBold,
    color: '#FFD700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.micro,
    color: '#CCCCCC',
    letterSpacing: 0.8,
    marginBottom: 6,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#000000',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  buttonStack: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  btn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
  },
  saveBtnText: {
    ...typography.captionBold,
    color: '#000000',
    letterSpacing: 1,
  },
  resetBtn: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
  },
  cancelBtnText: {
    ...typography.caption,
    color: '#8E8E93',
  },
});
