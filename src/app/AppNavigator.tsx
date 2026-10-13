import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CameraScreen } from '../features/camera/screens/CameraScreen';
import { GalleryScreen } from '../features/gallery/screens/GalleryScreen';
import { PhotoPreviewScreen } from '../features/gallery/screens/PhotoPreviewScreen';

export type RootStackParamList = {
  Camera: undefined;
  Gallery: undefined;
  PhotoPreview: { photoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Camera"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="PhotoPreview" component={PhotoPreviewScreen} />
    </Stack.Navigator>
  );
};
