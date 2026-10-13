import { NativeModules, TurboModuleRegistry, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Safely inspects whether 'RNShare' native module is registered in the native binary
 * before requiring 'react-native-share'.
 * In Expo Go, calling require('react-native-share') triggers TurboModuleRegistry.getEnforcing('RNShare'),
 * which crashes with an Invariant Violation. This lazy resolver safely prevents that crash.
 */
function getNativeShareModule(): any {
  try {
    const isRegistered = Boolean(
      TurboModuleRegistry?.get?.('RNShare') ||
      NativeModules?.RNShare ||
      NativeModules?.RNShareModule
    );
    if (!isRegistered) {
      return null;
    }
    // Only require react-native-share if the native module is actually present in the binary
    const sharePkg = require('react-native-share');
    return sharePkg?.default || sharePkg;
  } catch {
    return null;
  }
}

export class ShareService {
  /**
   * Checks whether react-native-share's native module is compiled into the current runtime.
   * True in Development Builds / APKs, false in standard Expo Go.
   */
  static isNativeShareAvailable(): boolean {
    return getNativeShareModule() !== null;
  }

  /**
   * Shares one or multiple image files directly to WhatsApp or any messaging app.
   * - In Development Builds / Standalone APK: Uses react-native-share with Intent.ACTION_SEND_MULTIPLE
   *   to attach all photos together into a single WhatsApp chat dialog.
   * - In Expo Go: Gracefully alerts user regarding Expo Go's single-file limit and offers
   *   guided one-by-one sharing without crashing.
   */
  static async sharePhotos(uris: string[], title = 'Share Photographs'): Promise<void> {
    if (!uris || uris.length === 0) return;

    // Normalize URIs: Ensure all paths have proper file:// prefix
    const cleanUris = uris.map((uri) => (uri.startsWith('file://') ? uri : `file://${uri}`));

    // 1. If Native Share module exists (Development Build / Standalone Build)
    const nativeShare = getNativeShareModule();
    if (nativeShare && typeof nativeShare.open === 'function') {
      try {
        await nativeShare.open({
          urls: cleanUris,
          type: 'image/jpeg',
          title,
          failOnCancel: false,
        });
        return;
      } catch (err: any) {
        // User dismissed / cancelled share sheet
        if (
          err?.message === 'User did not share' ||
          err?.message?.toLowerCase().includes('cancel') ||
          err?.message?.toLowerCase().includes('dismiss')
        ) {
          return;
        }
        console.warn('Native Share error, falling back:', err?.message);
      }
    }

    // 2. Fallback for Expo Go (or if native share fails)
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      return;
    }

    // If single photo, share directly without prompt
    if (cleanUris.length === 1) {
      try {
        await Sharing.shareAsync(cleanUris[0], {
          mimeType: 'image/jpeg',
          dialogTitle: title,
        });
      } catch (err: any) {
        if (!err?.message?.toLowerCase().includes('cancel')) {
          console.warn('Single photo share error:', err);
        }
      }
      return;
    }

    // Multi-photo in Expo Go:
    // Expo Go only supports 1 photo per share dialog due to Expo Go's bundled native limits.
    Alert.alert(
      'Multi-Photo Sharing Notice',
      `You selected ${cleanUris.length} photos.\n\nIn Expo Go, WhatsApp can only receive 1 photo at a time per share dialog. To attach all ${cleanUris.length} photos together into one WhatsApp message, run a Development Build (npx expo run:android).\n\nWould you like to share the selected photos one by one now?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Share One by One (${cleanUris.length})`,
          onPress: async () => {
            for (let i = 0; i < cleanUris.length; i++) {
              try {
                await Sharing.shareAsync(cleanUris[i], {
                  mimeType: 'image/jpeg',
                  dialogTitle: `${title} (${i + 1} of ${cleanUris.length})`,
                });
              } catch (err: any) {
                // If user cancels during one of the shares, break out
                if (err?.message?.toLowerCase().includes('cancel')) {
                  break;
                }
              }
            }
          },
        },
      ]
    );
  }

  /**
   * Shares a single image file.
   */
  static async shareSinglePhoto(uri: string, title = 'Share Photograph'): Promise<void> {
    return this.sharePhotos([uri], title);
  }
}
