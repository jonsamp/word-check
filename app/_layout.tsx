import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
// import { vexo, customEvent } from "vexo-analytics";
import { init, SessionStrategy } from "@bitdrift/react-native";

import { databaseManager } from "../constants/database";

import { View } from "react-native";
import { DictionaryProvider } from "../contexts/DictionaryContext";

SplashScreen.preventAutoHideAsync();

// vexo("73eed99e-9cb2-49fa-bacb-6dee903403c7");

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        init(
          "GiB8r0is1HCaIgLWxhkFegcVE7Ka/nfm5YJ2GpCdQgVsTCILRURUckFrb0FCWVUoEw==",
          SessionStrategy.Activity,
          {
            crashReporting: {
              enableNativeFatalIssues: true, // Enable native crash reporting (crashes, ANRs, etc.)
            },
            enableNetworkInstrumentation: true,
          }
        );
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

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
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
                presentation: "modal",
              }}
            />
          </Stack>
        </ThemeProvider>
      </DictionaryProvider>
    </View>
  );
}
