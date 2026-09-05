import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View as RNView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useObserve } from "expo-observe";

import { logEvent } from "../../utils/analytics";

import { View, Text } from "../../components/Themed";
import { useThemeColor } from "../../components/Themed";
import { type, sansSerifType } from "../../constants/Type";
import { ProgressRing } from "../../components/progress-ring";
import { PRACTICE_LISTS, PRACTICE_SECTIONS, STARRED_LIST_ID } from "../../constants/PracticeLists";
import { useTopScores } from "../../contexts/TopScoreContext";
import { useDifficulty } from "../../contexts/DifficultyContext";
import { useStarredWords } from "../../contexts/StarredWordsContext";
import { DifficultyNames } from "../../constants/difficulty";
import { STARRED_LIST_TITLE } from "../../hooks/usePracticeList";

type PracticeCardData = {
  id: string;
  title: string;
  wordCount: number;
};

export default function Practice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTopScore } = useTopScores();
  const { currentDifficulty } = useDifficulty();
  const { starredWords } = useStarredWords();
  const { markInteractive } = useObserve();
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const sections: { title: string; cards: PracticeCardData[] }[] = [];

  if (starredWords.length > 0) {
    sections.push({
      title: "Your list",
      cards: [{ id: STARRED_LIST_ID, title: STARRED_LIST_TITLE, wordCount: starredWords.length }],
    });
  }

  for (const section of PRACTICE_SECTIONS) {
    const cards = section.listIds
      .map((listId) => PRACTICE_LISTS[listId])
      .filter((list) => list !== undefined)
      .map((list) => ({ id: list.id, title: list.title, wordCount: list.words.length }));

    if (cards.length > 0) {
      sections.push({ title: section.title, cards });
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 8,
      }}
      colorKey="backgroundSecondary"
    >
      <RNView style={styles.headerRow}>
        <Text style={[styles.header, { color: textColor }]}>Practice</Text>
        <Text style={{ ...sansSerifType.subhead, color: textSecondaryColor, marginRight: 4 }}>
          {DifficultyNames[currentDifficulty]}
        </Text>
      </RNView>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {sections.map((section) => (
          <RNView key={section.title} style={styles.section}>
            <Text
              style={{
                ...sansSerifType.sectionHeader,
                color: textSecondaryColor,
                marginBottom: 10,
                marginLeft: 4,
              }}
            >
              {section.title}
            </Text>
            {section.cards.map((card) => (
              <PracticeCard
                key={card.id}
                card={card}
                topScore={getTopScore(card.id, currentDifficulty)}
                onOpenList={() => router.push(`/practice/${card.id}/list`)}
                onStartQuiz={() => {
                  logEvent("quiz.started", {
                    attributes: {
                      list: card.id,
                      difficulty: currentDifficulty,
                      wordCount: card.wordCount,
                    },
                  });
                  router.push(`/practice/${card.id}/quiz`);
                }}
              />
            ))}
          </RNView>
        ))}
      </ScrollView>
    </View>
  );
}

function PracticeCard({
  card,
  topScore,
  onOpenList,
  onStartQuiz,
}: {
  card: PracticeCardData;
  topScore: number | null;
  onOpenList: () => void;
  onStartQuiz: () => void;
}) {
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const tintColor = useThemeColor("tint");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.title}, ${card.wordCount} words${
        topScore === null ? "" : `, high score ${topScore} percent`
      }`}
      accessibilityHint="Opens the word list"
      onPress={onOpenList}
      style={({ pressed }) => [styles.card, { backgroundColor, opacity: pressed ? 0.85 : 1 }]}
    >
      <RNView style={styles.cardHeader}>
        <RNView style={styles.cardHeaderText}>
          <Text style={{ ...type.title, fontWeight: "bold" }}>{card.title}</Text>
          <Text
            style={{
              ...sansSerifType.footnote,
              color: textSecondaryColor,
              marginTop: 4,
            }}
          >
            {card.wordCount} words
          </Text>
        </RNView>
        <ProgressRing percentage={topScore} />
      </RNView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start quiz: ${card.title}`}
        onPress={onStartQuiz}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: tintColor, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ ...sansSerifType.headline, color: "#fff" }}>Start Quiz</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  header: {
    ...type.largeTitle,
    fontFamily: "New York",
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 28,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
  },
});
