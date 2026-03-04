import { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type } from "../../constants/Type";
import { PRACTICE_LISTS } from "../../constants/PracticeLists";

const PRACTICE_CARDS = Object.values(PRACTICE_LISTS).map((list) => ({
  id: list.id,
  title: list.title,
  wordCount: list.words.length,
  topScore: "0%",
}));

export default function Practice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const secondaryBackgroundColor = useThemeColor("backgroundSecondary");
  const tintColor = useThemeColor("tint");

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
      <RNView style={{ marginBottom: 12, paddingHorizontal: 20 }}>
        <Text style={[styles.header, { color: textColor, top: 8 }]}>Practice</Text>
      </RNView>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {PRACTICE_CARDS.map((card) => (
          <RNView
            key={card.title}
            style={[
              styles.card,
              {
                backgroundColor,
              },
            ]}
          >
            <RNView style={styles.cardHeader}>
              <RNView>
                <Text style={{ ...type.title, fontWeight: "bold" }}>{card.title}</Text>
                <Text style={{ ...type.callout, color: textSecondaryColor, marginTop: 4 }}>
                  {card.wordCount} words
                </Text>
              </RNView>
              <Text style={{ ...type.callout, color: textSecondaryColor }}>
                Top score: {card.topScore}
              </Text>
            </RNView>
            <RNView style={styles.cardButtons}>
              <Pressable
                onPress={() => router.push(`/practice/${card.id}/list`)}
                style={[
                  styles.button,
                  {
                    backgroundColor: secondaryBackgroundColor,
                  },
                ]}
              >
                <Text style={{ ...type.callout, fontWeight: "600", color: textColor }}>
                  View Words
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  {
                    backgroundColor: tintColor,
                  },
                ]}
              >
                <Text style={{ ...type.callout, fontWeight: "600", color: "#fff" }}>Quiz</Text>
              </Pressable>
            </RNView>
          </RNView>
        ))}
      </ScrollView>
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },
});
