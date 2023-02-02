import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme
} from "@react-navigation/native";
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';

import Bold from '../assets/fonts/sentinel-bold.otf';
import SemiBold from '../assets/fonts/sentinel-semibold.otf';
import Italic from '../assets/fonts/sentinel-bookItalic.otf';
import Regular from '../assets/fonts/sentinel-book.otf';

import { Dictionary, loadDictionaryAsync } from '../constants/database';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "index",
};

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadDictionaryAsync(Dictionary.NWL2020);
        await loadDictionaryAsync(Dictionary.CSW21);

        await Font.loadAsync({
          Bold,
          SemiBold,
          Italic,
          Regular,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="settings"
          options={{
            // Set the presentation mode to modal for our modal route.
            presentation: "modal",
            headerShown: false
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
