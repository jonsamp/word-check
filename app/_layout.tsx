import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import AppMetrics from "expo-eas-observe";

import { Platform, View, useColorScheme } from "react-native";
import { DictionaryProvider } from "../contexts/DictionaryContext";
import Colors from "../constants/Colors";

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = isDark
    ? Colors.dark.backgroundSecondary
    : Colors.light.backgroundSecondary;

  useEffect(() => {
    AppMetrics.markFirstRender();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor }}>
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
              name="about"
              options={{
                title: "About",
                headerShown: false,
                presentation: Platform.select({
                  android: "formSheet",
                  default: "modal",
                }),
                sheetAllowedDetents: Platform.select({
                  android: [0.8],
                  default: undefined,
                }),
              }}
            />
          </Stack>
        </ThemeProvider>
      </DictionaryProvider>
    </View>
  );
}
