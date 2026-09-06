import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useObserve } from "expo-observe";
import { logEvent } from "../../../utils/analytics";
import { View, Text, useThemeColor } from "../../../components/Themed";
import { ProgressRing } from "../../../components/progress-ring";
import { type } from "../../../constants/Type";
import { useTopScores } from "../../../contexts/TopScoreContext";
import { Difficulty } from "../../../constants/difficulty";
import { PracticeWord } from "../../../constants/PracticeLists";

function parseMissedWords(raw: string | undefined): PracticeWord[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Complete() {
  const { id, correct, total, difficulty, missed } = useLocalSearchParams<{
    id: string;
    correct: string;
    total: string;
    difficulty: string;
    missed?: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { saveScore, getTopScore } = useTopScores();
  const { markInteractive } = useObserve();

  const correctCount = Number(correct);
  const totalWords = Number(total);
  const percentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
  const resolvedDifficulty = (difficulty as Difficulty) ?? Difficulty.Level1;
  const missedWords = parseMissedWords(missed);

  // Snapshot the previous best before the save effect overwrites it.
  const [previousBest] = useState<number | null>(() => getTopScore(id, resolvedDifficulty));

  const tintColor = useThemeColor("tint");
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const successColor = useThemeColor("success");

  useLayoutEffect(() => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    saveScore(id, resolvedDifficulty, percentage);
    logEvent("quiz.completed", {
      attributes: {
        list: id,
        difficulty: resolvedDifficulty,
        correct: correctCount,
        total: totalWords,
        percentage,
      },
    });
  }, [id, difficulty, percentage]);

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const isNewBest = previousBest === null || percentage > previousBest;
  const delta = previousBest === null ? 0 : percentage - previousBest;
  const hasMissedWords = missedWords.length > 0;

  function startReview() {
    router.replace({
      pathname: `/practice/${id}/quiz`,
      params: { review: JSON.stringify(missedWords) },
    });
  }

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      colorKey="backgroundSecondary"
    >
      <RNView style={[styles.resultsCard, { backgroundColor }]}>
        <Text style={{ ...type.sectionHeader, color: textSecondaryColor }}>Quiz Results</Text>
        <RNView style={styles.ringWrapper}>
          <ProgressRing percentage={percentage} size={140} strokeWidth={10} showPercentSign />
        </RNView>
        <Text style={[type.title, { color: textSecondaryColor, textAlign: "center" }]}>
          You got {correctCount} out of {totalWords} words correct
        </Text>
        <RNView
          style={[
            styles.deltaPill,
            { backgroundColor: isNewBest ? `${successColor}22` : `${textSecondaryColor}18` },
          ]}
        >
          <Text
            style={{
              ...type.footnote,
              color: isNewBest ? successColor : textSecondaryColor,
            }}
          >
            {previousBest === null
              ? "First attempt"
              : isNewBest
                ? `New best, up ${delta} points`
                : `Your best is ${previousBest}%`}
          </Text>
        </RNView>
      </RNView>

      {hasMissedWords ? (
        <RNView style={styles.missedArea}>
          <Text
            style={{
              ...type.sectionHeader,
              color: textSecondaryColor,
              marginBottom: 10,
              marginLeft: 4,
            }}
          >
            Missed ({missedWords.length})
          </Text>
          <RNView style={styles.missedScrollArea}>
            <ScrollView
              contentContainerStyle={styles.missedScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {missedWords.map((entry) => (
                <RNView key={entry.word} style={[styles.missedCard, { backgroundColor }]}>
                  <Text style={{ ...type.wordTitle, color: textColor }}>{entry.word}</Text>
                  <Text
                    style={{
                      ...type.footnote,
                      color: textSecondaryColor,
                      marginTop: 4,
                    }}
                  >
                    {entry.definition}
                  </Text>
                </RNView>
              ))}
            </ScrollView>
          </RNView>
        </RNView>
      ) : (
        <RNView style={styles.spacer} />
      )}

      <RNView style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        {hasMissedWords && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Practice the ${missedWords.length} words you missed`}
            onPress={startReview}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ ...type.headline, color: textColor }}>Practice Missed</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Done"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: tintColor, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ ...type.headline, color: "#FFFFFF" }}>Done</Text>
        </Pressable>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCard: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  ringWrapper: {
    marginVertical: 20,
  },
  deltaPill: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  missedArea: {
    flex: 1,
    marginTop: 24,
  },
  missedScrollArea: {
    flex: 1,
  },
  missedScrollContent: {
    paddingTop: 4,
  },
  missedCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
  },
});
