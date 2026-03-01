import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import React, { useEffect } from "react";

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
    if (Platform.OS !== "web") {
      const AppMetrics = require("expo-eas-observe").default;
      AppMetrics.markFirstRender();
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor, alignItems: Platform.OS === "web" ? "center" : undefined }}>
      <View style={{ flex: 1, width: "100%", maxWidth: Platform.OS === "web" ? 600 : undefined, paddingVertical: Platform.OS === "web" ? 20 : undefined }}>
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
              name="practice"
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
    </View>
  );
}
