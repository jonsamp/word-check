import { Stack, useSegments } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import React, { type ReactNode } from "react";
import { AppMetricsRoot } from "expo-app-metrics";
import { Platform, View } from "react-native";

import useColorScheme from "../hooks/useColorScheme";
import { DictionaryProvider } from "../contexts/DictionaryContext";
import { DifficultyProvider } from "../contexts/DifficultyContext";
import { TopScoreProvider } from "../contexts/TopScoreContext";
import Colors from "../constants/Colors";

function AppProviders({
  skip,
  children,
}: {
  skip: boolean;
  children: ReactNode;
}) {
  if (skip) {
    return children;
  }

  return (
    <TopScoreProvider>
      <DictionaryProvider>
        <DifficultyProvider>{children}</DifficultyProvider>
      </DictionaryProvider>
    </TopScoreProvider>
  );
}

function Layout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === "web";
  const isDark = colorScheme === "dark";
  const segments = useSegments();
  const isStandalonePage =
    isWeb && (segments[0] === "home" || segments[0] === "privacy");
  const backgroundColor = isStandalonePage
    ? "#EAE6DB"
    : isDark
      ? Colors.dark.backgroundSecondary
      : Colors.light.backgroundSecondary;

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = !isWeb
    ? base
    : {
        ...base,
        colors: {
          ...base.colors,
          background: "transparent",
        },
      };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor,
        alignItems: isWeb && !isStandalonePage ? "center" : undefined,
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: isWeb && !isStandalonePage ? 500 : undefined,
          paddingVertical: isWeb && !isStandalonePage ? 20 : undefined,
        }}
      >
        <AppProviders skip={isStandalonePage}>
          <ThemeProvider value={navTheme}>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="practice"
                options={{
                  headerBackTitle: "Back",
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: isDark
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                  },
                  headerTintColor: isDark
                    ? Colors.dark.text
                    : Colors.light.text,
                  headerTitleStyle: {
                    fontFamily: "New York",
                    fontWeight: "bold" as const,
                  },
                }}
              />
              <Stack.Screen
                name="home"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="privacy"
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
        </AppProviders>
      </View>
    </View>
  );
}

export default AppMetricsRoot.wrap(Layout);
