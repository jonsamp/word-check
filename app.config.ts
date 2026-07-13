import { ExpoConfig } from "expo/config";

const isProduction = process.env.EAS_BUILD_PROFILE === "production";

const config: ExpoConfig = {
  version: process.env.APP_VERSION || "2026.14",
  name: "Word Check",
  slug: "word-check",
  scheme: "wordcheck",
  platforms: ["ios", "android", "web"],
  orientation: "default",
  userInterfaceStyle: "automatic",
  icon: isProduction ? "./assets/images/icon.png" : "./assets/images/icon-dev.png",
  updates: {
    url: "https://u.expo.dev/3d4f1d20-2fe7-44f9-823e-12cf6850b349",
  },
  ios: {
    bundleIdentifier: `jonsamp.words${isProduction ? "" : "-dev"}`,
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: isProduction ? "com.jonsamp.wordcheckpro" : "com.jonsamp.wordcheck_dev",
    permissions: [],
    icon: isProduction ? "./assets/images/icon.png" : "./assets/images/icon-dev.png",
    adaptiveIcon: {
      foregroundImage: isProduction
        ? "./assets/images/adaptive-foreground.png"
        : "./assets/images/adaptive-foreground-dev.png",
      backgroundImage: "./assets/images/adaptive-background.png",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    eas: {
      projectId: "3d4f1d20-2fe7-44f9-823e-12cf6850b349",
    },
  },
  plugins: [
    "expo-image",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "word-check",
        organization: "jon-samp",
      },
    ],
    "expo-status-bar",
    "@rnrepo/expo-config-plugin",
    [
      "expo-font",
      {
        fonts: ["./assets/fonts/NewYork.ttf"],
      },
    ],
    "expo-asset",
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#EAE6DB",
        image: "./assets/images/icon-splash.png",
        dark: {
          backgroundColor: "#1c1917",
          image: "./assets/images/icon-splash-dark.png",
        },
        imageWidth: 150,
      },
    ],
  ],
  owner: "expo-billing-madness",
};

export default config;
