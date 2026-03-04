import { useLayoutEffect } from "react";
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { PRACTICE_LISTS } from "../../../constants/PracticeLists";

export default function WordList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");

  const list = PRACTICE_LISTS[id];
  const words = list?.words ?? [];

  useLayoutEffect(() => {
    // Navigate up through Slot layers to reach the root Stack
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ title: list?.title ?? "Words" });
  }, [navigation, list?.title]);

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {words.map((item) => (
          <RNView
            key={item.word}
            style={[
              styles.card,
              {
                backgroundColor,
              },
            ]}
          >
            <Text style={styles.word}>{item.word}</Text>
            <Text style={{ ...type.callout, color: textSecondaryColor, marginTop: 6 }}>
              {item.definition}
            </Text>
          </RNView>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  word: {
    ...type.title,
    fontWeight: "bold",
  },
});
