import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
// import { vexo, customEvent } from "vexo-analytics";

import { databaseManager } from "../constants/database";

import { View } from "react-native";
import { DictionaryProvider } from "../contexts/DictionaryContext";

SplashScreen.preventAutoHideAsync();

// vexo("73eed99e-9cb2-49fa-bacb-6dee903403c7");

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Regular: require("../assets/fonts/sentinel-book.otf"),
    Italic: require("../assets/fonts/sentinel-bookItalic.otf"),
    SemiBold: require("../assets/fonts/sentinel-semibold.otf"),
    Bold: require("../assets/fonts/sentinel-bold.otf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await databaseManager.loadAllDatabases();
      } catch (e) {
        // customEvent("dictionary_load_error", {
        //   error: JSON.stringify(e),
        // });
        console.warn(e);
      } finally {
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
      <DictionaryProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </DictionaryProvider>
    </View>
  );
}
