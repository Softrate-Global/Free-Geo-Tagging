import React from 'react';
import { LogBox } from 'react-native';
import { AppProviders } from './src/app/providers/AppProviders';
import { AppNavigator } from './src/app/AppNavigator';

// Ignore Expo Go sandbox and SDK migration informational banners
LogBox.ignoreLogs([
  'Due to changes in Androids permission requirements',
  'Method makeDirectoryAsync imported from',
  'Method copyAsync imported from',
]);

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Due to changes in Androids permission requirements')
  ) {
    return;
  }
  originalWarn(...args);
};

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
