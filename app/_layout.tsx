import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme
} from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { Dictionary, loadDictionaryAsync } from '../constants/database';

import "../global.css"
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Regular: require('../assets/fonts/sentinel-book.otf'),
    Italic: require('../assets/fonts/sentinel-bookItalic.otf'),
    SemiBold: require('../assets/fonts/sentinel-semibold.otf'),
    Bold: require('../assets/fonts/sentinel-bold.otf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await loadDictionaryAsync(Dictionary.NWL2020);
        await loadDictionaryAsync(Dictionary.CSW21);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);
  
    const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{
          headerShown: false,
        }} />
        <Stack.Screen
          name="settings"
          options={{
            // Set the presentation mode to modal for our modal route.
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
    </View>
  );
}
