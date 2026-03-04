import { useLayoutEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { PRACTICE_LISTS } from "../../../constants/PracticeLists";

export default function Quiz() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const textSecondaryColor = useThemeColor("textSecondary");

  const list = PRACTICE_LISTS[id];

  useLayoutEffect(() => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ title: list?.title ?? "Quiz" });
  }, [navigation, list?.title]);

  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      colorKey="backgroundSecondary"
    >
      <Text style={{ ...type.title, color: textSecondaryColor }}>Quiz coming soon</Text>
    </View>
  );
}
