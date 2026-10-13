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
} from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { spacing, borderRadius } from '../../../core/theme/spacing';

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

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
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

  useEffect(() => {
    if (visible) {
      setPlaceName(initialPlaceName || '');
      setFormattedAddress(initialFormattedAddress || '');
      setSubAddress(initialSubAddress || '');
    }
  }, [visible, initialPlaceName, initialSubAddress, initialFormattedAddress]);

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
            <Text style={styles.title}>EDIT PLACE & ADDRESS</Text>
            <Text style={styles.subtitle}>
              Set your exact company, apartment, or house name and address. The app will remember it for these GPS coordinates ({latitude.toFixed(5)}, {longitude.toFixed(5)}).
            </Text>

            {/* Field 1: Company / Building / Apartment Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>COMPANY / BUILDING / APARTMENT NAME</Text>
              <TextInput
                style={styles.input}
                value={placeName}
                onChangeText={setPlaceName}
                placeholder="e.g. SOFTRATE TECH PARK"
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
                placeholder="e.g. 60A, Velleeswarar Koil St, Srinivasa Nagar, Mangadu, Chennai 600122"
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
                placeholder="e.g. Mangadu, Chennai or Poonamallee, India"
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
};

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
    marginBottom: spacing.lg,
    lineHeight: 18,
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
