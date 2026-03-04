import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { useTopScores } from "../../../contexts/TopScoreContext";

export default function Complete() {
  const { id, correct, total } = useLocalSearchParams<{
    id: string;
    correct: string;
    total: string;
  }>();
  const router = useRouter();
  const { saveScore } = useTopScores();

  const correctCount = Number(correct);
  const totalWords = Number(total);
  const percentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

  const tintColor = useThemeColor("tint");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");

  useEffect(() => {
    saveScore(id, percentage);
  }, [id, percentage]);

  return (
    <View style={styles.container} colorKey="backgroundSecondary">
      <View style={styles.contentArea} colorKey="backgroundSecondary">
        <View style={[styles.resultsCard, { backgroundColor }]}>
          <Text style={[type.title, { color: textSecondaryColor }]}>Quiz Results</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={[type.title, { color: textSecondaryColor }]}>
            You got {correctCount} out of {totalWords} words correct
          </Text>
        </View>
      </View>

      <View style={[styles.bottomCard, { backgroundColor }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.doneButton, { backgroundColor: tintColor }]}
        >
          <Text style={[type.headline, styles.doneButtonText]}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 120,
  },
  resultsCard: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  percentageText: {
    fontFamily: "New York",
    fontSize: 64,
    fontWeight: "bold",
    marginVertical: 24,
  },
  bottomCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 44,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  doneButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
  },
});
