module.exports = {
  presets: [
    ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    "nativewind/babel",
  ],
  plugins: [
    // Required for expo-router
    "react-native-reanimated/plugin",
  ],
};