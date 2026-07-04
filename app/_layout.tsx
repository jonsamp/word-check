import { Observe, ObserveRoot } from "expo-observe";
import { Stack, useSegments } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import React, { type ReactNode } from "react";
import { Platform, View } from "react-native";

import useColorScheme from "../hooks/useColorScheme";
import { XDE } from "../dev/xde";
import { DictionaryProvider } from "../contexts/DictionaryContext";
import { DifficultyProvider } from "../contexts/DifficultyContext";
import { TopScoreProvider } from "../contexts/TopScoreContext";
import Colors from "../constants/Colors";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://dcc25b5b50053ff6cf6cbc23bec30083@o4509016320049152.ingest.us.sentry.io/4511677123526656',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Enable the expo-router integration so navigation metrics (cold_ttr, warm_ttr,
// tti) are recorded per route. Must run at module scope, before ObserveRoot
// mounts — the integration cannot be toggled after the app tree mounts.
Observe.configure({
  integrations: { "expo-router": true },
});

function AppProviders({ skip, children }: { skip: boolean; children: ReactNode }) {
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
  const isStandalonePage = isWeb && (segments[0] === "home" || segments[0] === "privacy");
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
            <XDE />
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
                  headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
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
            </Stack>
          </ThemeProvider>
        </AppProviders>
      </View>
    </View>
  );
}

export default Sentry.wrap(ObserveRoot.wrap(Layout));
