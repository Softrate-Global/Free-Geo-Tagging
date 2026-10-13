import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { CameraScreen } from '../features/camera/screens/CameraScreen';
import { GalleryScreen } from '../features/gallery/screens/GalleryScreen';
import { PhotoPreviewScreen } from '../features/gallery/screens/PhotoPreviewScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Camera: undefined;
  Gallery: undefined;
  PhotoPreview: { photoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
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
