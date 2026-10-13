import React from 'react';
import { LogBox } from 'react-native';
import { AppProviders } from './src/app/providers/AppProviders';
import { AppNavigator } from './src/app/AppNavigator';

// Ignore Expo Go sandbox and SDK migration informational banners
LogBox.ignoreLogs([
  'Due to changes in Androids permission requirements, Expo Go can no longer provide full access to the media library',
  'Method makeDirectoryAsync imported from',
  'Method copyAsync imported from',
]);

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
