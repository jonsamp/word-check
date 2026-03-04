import React from "react";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const textSecondaryColor = useThemeColor("textSecondary");

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        alignItems: "center",
        justifyContent: "center",
      }}
      colorKey="backgroundSecondary"
    >
      <Text style={{ ...type.body, color: textSecondaryColor }}>Coming soon.</Text>
    </View>
  );
}
