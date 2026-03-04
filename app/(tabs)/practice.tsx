import { useEffect } from "react";
import { Platform, StyleSheet, View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";

export default function Practice() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");

  function markFirstRender() {
    if (!isWeb) {
      (async () => {
        const module = await import("expo-eas-observe");
        const AppMetrics = module.default;
        AppMetrics.markFirstRender();
      })();
    }
  }

  useEffect(() => {
    if (!isWeb) {
      (async () => {
        const module = await import("expo-eas-observe");
        const AppMetrics = module.default;
        AppMetrics.markInteractive();
      })();
    }
  }, [isWeb]);

  return (
    <View
      onLayout={markFirstRender}
      style={{
        flex: 1,
        paddingTop: insets.top + 8,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView style={{ marginBottom: 24, paddingHorizontal: 20 }}>
        <Text style={[styles.header, { color: textColor, top: 8 }]}>Practice</Text>
      </RNView>
      <RNView style={styles.container}>
        <Text
          style={{
            ...type.body,
            color: textSecondaryColor,
            textAlign: "center",
            lineHeight: 26,
          }}
        >
          Coming soon.
        </Text>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...type.largeTitle,
    fontFamily: "New York",
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
