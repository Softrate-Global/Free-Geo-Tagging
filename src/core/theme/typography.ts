import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

const fontMono = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  header: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  } as TextStyle,
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  } as TextStyle,
  subtitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  } as TextStyle,
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 16,
  } as TextStyle,
  captionBold: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  } as TextStyle,
  micro: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  } as TextStyle,
  dataMono: {
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 18,
  } as TextStyle,
  watermarkHeading: {
    fontFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  } as TextStyle,
  watermarkText: {
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 16,
  } as TextStyle,
} as const;
