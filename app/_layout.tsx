import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useFonts as useCaprasimo, Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  useFonts as useFigtree,
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [caprasimoLoaded] = useCaprasimo({ Caprasimo_400Regular });
  const [figtreeLoaded] = useFigtree({ Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold });
  const fontsReady = caprasimoLoaded && figtreeLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) await SplashScreen.hideAsync();
  }, [fontsReady]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
