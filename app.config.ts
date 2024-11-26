import { ExpoConfig } from "expo/config";

const isProduction = process.env.EAS_BUILD_PROFILE === "production";

const config: ExpoConfig = {
  name: "Word Check",
  slug: "word-check",
  scheme: "wordcheck",
  newArchEnabled: true,
  platforms: ["ios", "android", "web"],
  version: "2024.52.0",
  orientation: "default",
  userInterfaceStyle: "automatic",
  icon: isProduction
    ? "./assets/images/icon.png"
    : "./assets/images/icon-dev.png",
  updates: {
    url: "https://u.expo.dev/dd591e49-d2d1-4ce0-bef9-49746a819ec0",
  },
  ios: {
    bundleIdentifier: `jonsamp.words${isProduction ? "" : "-dev"}`,
    supportsTablet: true,
  },
  android: {
    package: `com.jonsamp.wordcheck${isProduction ? "" : "-dev"}`,
    permissions: [],
    icon: isProduction
      ? "./assets/images/icon.png"
      : "./assets/images/icon-dev.png",
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
  owner: "jonsamp",
};

export default config;
