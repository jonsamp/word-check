import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import React, { useEffect, useMemo } from "react";

import { Platform, View } from "react-native";
import useColorScheme from "../hooks/useColorScheme";
import { DictionaryProvider } from "../contexts/DictionaryContext";
import Colors from "../constants/Colors";

export default function Layout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === "web";
  const isDark = colorScheme === "dark";
  const backgroundColor = isDark
    ? Colors.dark.backgroundSecondary
    : Colors.light.backgroundSecondary;

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    if (!isWeb) return base;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: "transparent",
      },
    };
  }, [isDark, isWeb]);

  useEffect(() => {
    if (!isWeb) {
      (async () => {
        const module = await import("expo-eas-observe");
        const AppMetrics = module.default;
        AppMetrics.markFirstRender();
      })();
    }
  }, [isWeb]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor,
        alignItems: isWeb ? "center" : undefined,
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: isWeb ? 500 : undefined,
          paddingVertical: isWeb ? 20 : undefined,
        }}
      >
        <DictionaryProvider>
          <ThemeProvider value={navTheme}>
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
    </View>
  );
}
