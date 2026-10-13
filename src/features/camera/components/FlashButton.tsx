import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FlashMode } from 'expo-camera';
import { typography } from '../../../core/theme/typography';

interface FlashButtonProps {
  mode: FlashMode;
  onToggle: () => void;
  disabled?: boolean;
}

export const FlashButton: React.FC<FlashButtonProps> = ({
  mode,
  onToggle,
  disabled = false,
}) => {
  const getLabel = () => {
    switch (mode) {
      case 'on':
        return 'FLASH ON';
      case 'auto':
        return 'FLASH AUTO';
      default:
        return 'FLASH OFF';
    }
  };

  const isActive = mode === 'on' || mode === 'auto';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      disabled={disabled}
      style={[styles.button, isActive && styles.buttonActive]}
    >
      <Text style={[styles.text, isActive && styles.textActive]}>{getLabel()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  text: {
    ...typography.micro,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  textActive: {
    color: '#000000',
    fontWeight: '700',
  },
});
