import { useLayoutEffect, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { View, Text, useThemeColor } from "../../../components/Themed";
import { CheckIcon, XIcon } from "../../../components/Icons";
import { type } from "../../../constants/Type";
import { PRACTICE_LISTS, PracticeWord } from "../../../constants/PracticeLists";
import { generateQuizWord, generateChoices, shuffleArray, QuizWord } from "../../../constants/quiz";
import { lookUpWord } from "../../../constants/database";
import { useDifficulty } from "../../../contexts/DifficultyContext";
import { useDictionary } from "../../../contexts/DictionaryContext";
import { DifficultyNames } from "../../../constants/difficulty";

const TILE_SIZE = 64;
const TILE_GAP = 10;

export default function Quiz() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { currentDifficulty } = useDifficulty();
  const { currentDictionary } = useDictionary();

  const list = PRACTICE_LISTS[id];
  const [words] = useState<PracticeWord[]>(() => {
    const shuffled = shuffleArray(list.words);
    return list.quizSize ? shuffled.slice(0, list.quizSize) : shuffled;
  });
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState<"correct" | "incorrect" | null>(null);

  const [quizWord, setQuizWord] = useState<QuizWord>(() =>
    generateQuizWord(words[0].word, currentDifficulty, list.requiredLetters)
  );
  const [choices, setChoices] = useState<string[]>(() => generateChoices(quizWord.blanks));
  const [selectedBlankIndex, setSelectedBlankIndex] = useState(0);
  const [filledLetters, setFilledLetters] = useState<Map<number, string>>(new Map());
  const [usedChoiceIndices, setUsedChoiceIndices] = useState<Set<number>>(new Set());

  const textColor = useThemeColor("text");
  const backgroundSecondaryColor = useThemeColor("backgroundSecondary");
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");
  const backgroundColor = useThemeColor("background");

  useLayoutEffect(() => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ title: list?.title ?? "Quiz" });
  }, [navigation, list?.title]);

  // Compute blank tile indices (indices into quizWord.tiles where isBlank is true)
  const blankTileIndices = quizWord.tiles.reduce<number[]>((acc, tile, index) => {
    if (tile.isBlank) {
      acc.push(index);
    }
    return acc;
  }, []);

  const currentBlankTileIndex = blankTileIndices[selectedBlankIndex];
  const allBlanksFilled = filledLetters.size === quizWord.blanks.length;
  const wordsAttempted = submittedAnswer !== null ? wordIndex + 1 : wordIndex;
  const percentage = wordsAttempted > 0 ? Math.round((correctCount / wordsAttempted) * 100) : 0;

  function initializeWord(index: number) {
    const newQuizWord = generateQuizWord(
      words[index].word,
      currentDifficulty,
      list.requiredLetters
    );
    const newChoices = generateChoices(newQuizWord.blanks);
    setQuizWord(newQuizWord);
    setChoices(newChoices);
    setSelectedBlankIndex(0);
    setFilledLetters(new Map());
    setUsedChoiceIndices(new Set());
    setSubmittedAnswer(null);
  }

  function handleChoiceTap(choiceIndex: number) {
    if (usedChoiceIndices.has(choiceIndex) || submittedAnswer !== null) {
      return;
    }
    if (currentBlankTileIndex === undefined) {
      return;
    }

    const nextFilled = new Map(filledLetters);
    const nextUsed = new Set(usedChoiceIndices);

    // If the selected blank already has a letter, return that choice first
    if (filledLetters.has(currentBlankTileIndex)) {
      const oldLetter = filledLetters.get(currentBlankTileIndex)!;
      const oldChoiceIdx = choices.findIndex(
        (choice, idx) =>
          choice === oldLetter &&
          nextUsed.has(idx) &&
          !isChoiceUsedElsewhere(idx, currentBlankTileIndex)
      );
      if (oldChoiceIdx !== -1) {
        nextUsed.delete(oldChoiceIdx);
      }
    }

    nextFilled.set(currentBlankTileIndex, choices[choiceIndex]);
    nextUsed.add(choiceIndex);
    setFilledLetters(nextFilled);
    setUsedChoiceIndices(nextUsed);

    // Advance to next empty blank
    const nextEmptyBlank = blankTileIndices.findIndex(
      (tileIdx, blankIdx) => blankIdx > selectedBlankIndex && !nextFilled.has(tileIdx)
    );
    if (nextEmptyBlank !== -1) {
      setSelectedBlankIndex(nextEmptyBlank);
    }
  }

  function handleBlankTap(tileIndex: number) {
    if (submittedAnswer !== null) {
      return;
    }

    const blankIdx = blankTileIndices.indexOf(tileIndex);
    if (blankIdx === -1) {
      return;
    }

    // If this blank is filled, remove the letter and return the choice
    if (filledLetters.has(tileIndex)) {
      const letter = filledLetters.get(tileIndex)!;
      const nextFilled = new Map(filledLetters);
      nextFilled.delete(tileIndex);
      setFilledLetters(nextFilled);

      // Find the choice index that placed this letter and un-use it
      const choiceIdx = choices.findIndex(
        (choice, idx) =>
          choice === letter && usedChoiceIndices.has(idx) && !isChoiceUsedElsewhere(idx, tileIndex)
      );
      if (choiceIdx !== -1) {
        const nextUsed = new Set(usedChoiceIndices);
        nextUsed.delete(choiceIdx);
        setUsedChoiceIndices(nextUsed);
      }
    }

    setSelectedBlankIndex(blankIdx);
  }

  function isChoiceUsedElsewhere(choiceIdx: number, excludeTileIndex: number): boolean {
    // Check if this choice index is mapped to another blank tile
    const letter = choices[choiceIdx];
    let count = 0;
    for (const [tileIdx, filledLetter] of filledLetters) {
      if (tileIdx !== excludeTileIndex && filledLetter === letter) {
        count++;
      }
    }
    // Count how many times this exact choice index's letter appears in used choices
    let usedCount = 0;
    for (const idx of usedChoiceIndices) {
      if (idx !== choiceIdx && choices[idx] === letter) {
        usedCount++;
      }
    }
    return count > usedCount;
  }

  async function handleSubmit() {
    if (!allBlanksFilled) {
      return;
    }

    const filledWord = quizWord.tiles
      .map((tile, index) => (tile.isBlank ? (filledLetters.get(index) ?? "") : tile.letter))
      .join("");

    const result = await lookUpWord(filledWord, currentDictionary);

    if (result.isValid) {
      setCorrectCount(correctCount + 1);
      setSubmittedAnswer("correct");
    } else {
      setSubmittedAnswer("incorrect");
    }
  }

  function handleNext() {
    const nextIndex = wordIndex + 1;
    if (nextIndex < words.length) {
      setWordIndex(nextIndex);
      initializeWord(nextIndex);
    } else {
      router.replace(`/practice/${id}/complete?correct=${correctCount}&total=${words.length}`);
    }
  }

  return (
    <View style={styles.container} colorKey="backgroundSecondary">
      {/* Status Pills */}
      <View style={styles.pillsRow} colorKey="backgroundSecondary">
        <StatusPill text={`${wordIndex + 1}/${words.length} words`} />
        <StatusPill text={`${percentage}% Correct`} />
        <StatusPill text={DifficultyNames[currentDifficulty]} />
      </View>

      {/* Word Tiles */}
      <View style={styles.wordTilesContainer} colorKey="backgroundSecondary">
        <View style={styles.wordTilesRow} colorKey="backgroundSecondary">
          {quizWord.tiles.map((tile, index) => {
            const isBlank = tile.isBlank;
            const filled = filledLetters.get(index);
            const isSelected = isBlank && index === currentBlankTileIndex;

            if (!isBlank) {
              return (
                <View key={index} style={[styles.wordTile, { backgroundColor }]}>
                  <Text style={[styles.wordTileLetter, { color: textColor }]}>{tile.letter}</Text>
                </View>
              );
            }

            return (
              <Pressable key={index} onPress={() => handleBlankTap(index)}>
                <View
                  style={[
                    styles.wordTile,
                    {
                      backgroundColor: filled || isSelected ? tintColor + "25" : backgroundColor,
                      borderColor: isSelected ? tintColor + "60" : "transparent",
                      borderWidth: 3,
                    },
                  ]}
                >
                  {filled ? (
                    <Text style={[styles.wordTileLetter, { color: textColor }]}>{filled}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom Card: choices/result + button */}
      <Animated.View
        layout={LinearTransition.duration(200).easing(Easing.out(Easing.ease))}
        style={[styles.bottomCard, { backgroundColor }]}
      >
        {submittedAnswer === null ? (
          <View style={styles.choicesContainer}>
            <View style={styles.choicesRow}>
              {choices.slice(0, 4).map((letter, index) => (
                <ChoiceTile
                  key={index}
                  letter={letter}
                  used={usedChoiceIndices.has(index)}
                  onPress={() => handleChoiceTap(index)}
                  textColor={textColor}
                  tintColor={tintColor}
                  backgroundColor={backgroundSecondaryColor}
                  usedBackgroundColor={backgroundSecondaryColor}
                  borderColor={borderColor}
                />
              ))}
            </View>
            <View style={styles.choicesRow}>
              {choices.slice(4, 7).map((letter, index) => {
                const choiceIndex = index + 4;
                return (
                  <ChoiceTile
                    key={choiceIndex}
                    letter={letter}
                    used={usedChoiceIndices.has(choiceIndex)}
                    onPress={() => handleChoiceTap(choiceIndex)}
                    textColor={textColor}
                    tintColor={tintColor}
                    backgroundColor={backgroundSecondaryColor}
                    usedBackgroundColor={backgroundSecondaryColor}
                    borderColor={borderColor}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.resultContent}>
            {submittedAnswer === "correct" ? (
              <>
                <CheckIcon />
                <Text style={[type.title, { marginTop: 8 }]}>Correct!</Text>
              </>
            ) : (
              <>
                <XIcon />
                <Text style={[type.title, { marginTop: 8 }]}>Answer:</Text>
                <View style={styles.resultTilesRow}>
                  {quizWord.tiles.map((tile, index) => (
                    <View
                      key={index}
                      style={[
                        styles.resultTile,
                        {
                          backgroundColor: tile.isBlank
                            ? tintColor + "30"
                            : backgroundSecondaryColor,
                        },
                      ]}
                    >
                      <Text style={[styles.resultTileLetter, { color: textColor }]}>
                        {tile.letter}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
        <Pressable
          onPress={submittedAnswer !== null ? handleNext : handleSubmit}
          disabled={submittedAnswer === null && !allBlanksFilled}
          style={[
            styles.submitButton,
            {
              backgroundColor:
                submittedAnswer !== null || allBlanksFilled ? tintColor : borderColor,
            },
          ]}
        >
          <Text style={[type.headline, styles.submitButtonText]}>
            {submittedAnswer !== null ? "Next" : "Submit"}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function StatusPill({ text }: { text: string }) {
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[type.subhead, { color: textSecondaryColor }]}>{text}</Text>
    </View>
  );
}

function ChoiceTile({
  letter,
  used,
  onPress,
  textColor,
  tintColor,
  backgroundColor,
  usedBackgroundColor,
  borderColor,
}: {
  letter: string;
  used: boolean;
  onPress: () => void;
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  usedBackgroundColor: string;
  borderColor: string;
}) {
  return (
    <Pressable onPress={onPress} disabled={used}>
      <View
        style={[
          styles.wordTile,
          {
            backgroundColor: used ? usedBackgroundColor : backgroundColor,
          },
        ]}
      >
        <Text style={[styles.wordTileLetter, { color: used ? borderColor : textColor }]}>
          {letter}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  wordTilesContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: Platform.OS === "web" ? 40 : "30%",
  },
  wordTilesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: TILE_GAP,
  },
  wordTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  wordTileLetter: {
    ...type.titleOne,
    fontWeight: "600",
  },
  resultTilesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  resultTile: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTileLetter: {
    ...type.callout,
    fontWeight: "600",
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
  choicesContainer: {
    alignItems: "center",
    gap: TILE_GAP,
    marginBottom: 24,
  },
  choicesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: TILE_GAP,
  },
  resultContent: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
  },
});
