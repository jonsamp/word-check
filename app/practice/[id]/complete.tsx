import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useObserve } from "expo-observe";
import { logEvent } from "../../../utils/analytics";
import { View, Text, useThemeColor } from "../../../components/Themed";
import { ProgressRing } from "../../../components/progress-ring";
import { type, sansSerifType } from "../../../constants/Type";
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
  const dangerColor = useThemeColor("danger");

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (missedWords.length > 0 ? 160 : 110) },
        ]}
      >
        <RNView style={[styles.resultsCard, { backgroundColor }]}>
          <Text style={{ ...sansSerifType.sectionHeader, color: textSecondaryColor }}>
            Quiz Results
          </Text>
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
                ...sansSerifType.footnote,
                fontWeight: "600",
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

        {missedWords.length > 0 && (
          <RNView style={styles.missedSection}>
            <Text
              style={{
                ...sansSerifType.sectionHeader,
                color: textSecondaryColor,
                marginBottom: 10,
                marginLeft: 4,
              }}
            >
              Missed ({missedWords.length})
            </Text>
            {missedWords.map((entry) => (
              <RNView key={entry.word} style={[styles.missedCard, { backgroundColor }]}>
                <RNView style={styles.missedRow}>
                  <Text style={{ ...type.title, fontWeight: "bold", color: textColor }}>
                    {entry.word}
                  </Text>
                  <RNView style={[styles.missedDot, { backgroundColor: dangerColor }]} />
                </RNView>
                <Text
                  style={{
                    ...sansSerifType.footnote,
                    color: textSecondaryColor,
                    marginTop: 4,
                  }}
                >
                  {entry.definition}
                </Text>
              </RNView>
            ))}
          </RNView>
        )}
      </ScrollView>

      <RNView style={[styles.bottomCard, { backgroundColor, bottom: insets.bottom + 12 }]}>
        {missedWords.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Practice the ${missedWords.length} words you missed`}
            onPress={startReview}
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
          >
            <Text style={[sansSerifType.headline, { color: "#FFFFFF" }]}>
              Practice the {missedWords.length} you missed
            </Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Done"
          onPress={() => router.back()}
          style={[
            styles.secondaryButton,
            missedWords.length > 0
              ? { backgroundColor: "transparent" }
              : { backgroundColor: tintColor },
          ]}
        >
          <Text
            style={[
              sansSerifType.headline,
              { color: missedWords.length > 0 ? textSecondaryColor : "#FFFFFF" },
            ]}
          >
            Done
          </Text>
        </Pressable>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  missedSection: {
    marginTop: 28,
  },
  missedCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  missedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  missedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomCard: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 36,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  primaryButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButton: {
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
  },
});
