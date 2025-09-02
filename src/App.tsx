// App.tsx (o index.tsx)
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument without the required addListener',
  'new NativeEventEmitter() was called with a non-null argument without the required removeListeners',
]);

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {colors} from '@/theme';
import RootNavigator from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
