import { ExpoConfig } from "expo/config";

const isDevelopment = process.env.EAS_BUILD_PROFILE === "development";

const config: ExpoConfig = {
  name: "Word Check",
  slug: "word-check",
  scheme: "wordcheck",
  newArchEnabled: true,
  platforms: ["ios", "android", "web"],
  version: "2024.52.0",
  orientation: "default",
  userInterfaceStyle: "automatic",
  icon: isDevelopment
    ? "./assets/images/icon-dev.png"
    : "./assets/images/icon.png",
  updates: {
    url: "https://u.expo.dev/dd591e49-d2d1-4ce0-bef9-49746a819ec0",
  },
  ios: {
    bundleIdentifier: `jonsamp.words${isDevelopment ? "-dev" : ""}`,
    supportsTablet: true,
  },
  android: {
    package: `com.jonsamp.wordcheck${isDevelopment ? "-dev" : ""}`,
    permissions: [],
    icon: isDevelopment
      ? "./assets/images/icon-dev.png"
      : "./assets/images/icon.png",
    adaptiveIcon: {
      foregroundImage: isDevelopment
        ? "./assets/images/adaptive-foreground-dev.png"
        : "./assets/images/adaptive-foreground.png",
      backgroundImage: "./assets/images/adaptive-background.png",
    },
  },
  runtimeVersion: {
    policy: "fingerprint",
  },
  extra: {
    eas: {
      projectId: "dd591e49-d2d1-4ce0-bef9-49746a819ec0",
    },
  },
  plugins: [
    "expo-font",
    "expo-asset",
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash.png",
        imageWidth: 300,
        dark: {
          backgroundColor: "#151617",
        },
      },
    ],
  ],
  owner: "jonsamp",
};

export default config;
