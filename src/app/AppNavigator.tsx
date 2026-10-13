import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { CameraScreen } from '../features/camera/screens/CameraScreen';
import { GalleryScreen } from '../features/gallery/screens/GalleryScreen';
import { PhotoPreviewScreen } from '../features/gallery/screens/PhotoPreviewScreen';
import { APP_CONSTANTS } from '../core/constants/appConstants';

export type RootStackParamList = {
  Welcome: undefined;
  Camera: undefined;
  Gallery: undefined;
  PhotoPreview: { photoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'Camera' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkOnboardingStatus() {
      try {
        const completed = await AsyncStorage.getItem(APP_CONSTANTS.ONBOARDING_COMPLETED_KEY);
        const legacyCompleted = await AsyncStorage.getItem('@has_seen_onboarding_v1');

        if (isMounted) {
          if (completed === 'true' || legacyCompleted === 'true') {
            setInitialRoute('Camera');
          } else {
            setInitialRoute('Welcome');
          }
        }
      } catch {
        if (isMounted) {
          setInitialRoute('Welcome');
        }
      }
    }

    checkOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show dark background while checking local storage on app cold start
  if (!initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="PhotoPreview" component={PhotoPreviewScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
