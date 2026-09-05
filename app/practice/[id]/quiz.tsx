import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useObserve } from "expo-observe";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { View, Text, useThemeColor } from "../../../components/Themed";
import { BackspaceIcon, CheckIcon, CloseIcon, XIcon } from "../../../components/Icons";
import { Tile, TileVariant } from "../../../components/tile";
import { ProgressBar } from "../../../components/progress-bar";
import { type, sansSerifType } from "../../../constants/Type";
import { PracticeWord } from "../../../constants/PracticeLists";
import { usePracticeList } from "../../../hooks/usePracticeList";
import { generateQuizWord, generateChoices, shuffleArray, QuizWord } from "../../../constants/quiz";
import { lookUpWord } from "../../../constants/database";
import { useDifficulty } from "../../../contexts/DifficultyContext";
import { useDictionary } from "../../../contexts/DictionaryContext";

const TILE_SIZE_LARGE = 64;
const TILE_SIZE_MEDIUM = 44;
const TILE_SIZE_SMALL = 38;
const TILE_GAP = 10;
const SWAP_AREA_HEIGHT = 220;
const ESTIMATED_CARD_HEIGHT = 310;

function parseReviewWords(raw: string | undefined): PracticeWord[] {
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

const EMPTY_QUIZ_WORD: QuizWord = { word: "", tiles: [], blanks: [] };

export default function Quiz() {
  const { id, review } = useLocalSearchParams<{ id: string; review?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDifficulty } = useDifficulty();
  const { currentDictionary } = useDictionary();
  const { markInteractive } = useObserve();

  const list = usePracticeList(id);
  const [words] = useState<PracticeWord[]>(() => {
    const reviewWords = parseReviewWords(review);
    if (reviewWords.length > 0) {
      return reviewWords;
    }
    const shuffled = shuffleArray(list?.words ?? []);
    return list?.quizSize ? shuffled.slice(0, list.quizSize) : shuffled;
  });
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedWords, setMissedWords] = useState<PracticeWord[]>([]);
  const [submittedAnswer, setSubmittedAnswer] = useState<"correct" | "incorrect" | null>(null);
  const [lookupDefinition, setLookupDefinition] = useState<string | null>(null);

  const [quizWord, setQuizWord] = useState<QuizWord>(() =>
    words.length > 0
      ? generateQuizWord(words[0].word, currentDifficulty, list?.requiredLetters)
      : EMPTY_QUIZ_WORD
  );
  const [choices, setChoices] = useState<string[]>(() => generateChoices(quizWord.blanks));
  const [selectedBlankIndex, setSelectedBlankIndex] = useState(0);
  const [filledLetters, setFilledLetters] = useState<Map<number, string>>(new Map());
  const [usedChoiceIndices, setUsedChoiceIndices] = useState<Set<number>>(new Set());
  const [bottomCardHeight, setBottomCardHeight] = useState(ESTIMATED_CARD_HEIGHT);

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundSecondaryColor = useThemeColor("backgroundSecondary");
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");
  const backgroundColor = useThemeColor("background");

  useLayoutEffect(() => {
    const rootNav = navigation.getParent()?.getParent();
    rootNav?.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  // Compute blank tile indices (indices into quizWord.tiles where isBlank is true)
  const blankTileIndices = quizWord.tiles.reduce<number[]>((acc, tile, index) => {
    if (tile.isBlank) {
      acc.push(index);
    }
    return acc;
  }, []);

  const currentBlankTileIndex = blankTileIndices[selectedBlankIndex];
  const wordLength = quizWord.tiles.length;
  const tileSize =
    wordLength > 7 ? TILE_SIZE_SMALL : wordLength > 5 ? TILE_SIZE_MEDIUM : TILE_SIZE_LARGE;
  const allBlanksFilled = filledLetters.size === quizWord.blanks.length;
  const wordsAttempted = submittedAnswer !== null ? wordIndex + 1 : wordIndex;
  const percentage = wordsAttempted > 0 ? Math.round((correctCount / wordsAttempted) * 100) : 0;
  const clue = words[wordIndex]?.definition ?? "";

  function initializeWord(index: number) {
    const newQuizWord = generateQuizWord(
      words[index].word,
      currentDifficulty,
      list?.requiredLetters
    );
    const newChoices = generateChoices(newQuizWord.blanks);
    setQuizWord(newQuizWord);
    setChoices(newChoices);
    setSelectedBlankIndex(0);
    setFilledLetters(new Map());
    setUsedChoiceIndices(new Set());
    setSubmittedAnswer(null);
    setLookupDefinition(null);
  }

  function handleChoiceTap(choiceIndex: number) {
    if (usedChoiceIndices.has(choiceIndex) || submittedAnswer !== null) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  function handleBackspace() {
    if (submittedAnswer !== null) {
      return;
    }

    // Find the right-most filled blank
    let rightmostBlankIdx = -1;
    for (let index = blankTileIndices.length - 1; index >= 0; index--) {
      if (filledLetters.has(blankTileIndices[index])) {
        rightmostBlankIdx = index;
        break;
      }
    }
    if (rightmostBlankIdx === -1) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tileIndex = blankTileIndices[rightmostBlankIdx];
    const letter = filledLetters.get(tileIndex)!;
    const nextFilled = new Map(filledLetters);
    nextFilled.delete(tileIndex);
    setFilledLetters(nextFilled);

    const choiceIdx = choices.findIndex(
      (choice, idx) =>
        choice === letter && usedChoiceIndices.has(idx) && !isChoiceUsedElsewhere(idx, tileIndex)
    );
    if (choiceIdx !== -1) {
      const nextUsed = new Set(usedChoiceIndices);
      nextUsed.delete(choiceIdx);
      setUsedChoiceIndices(nextUsed);
    }

    setSelectedBlankIndex(rightmostBlankIdx);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, 50));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const filledWord = quizWord.tiles
      .map((tile, index) => (tile.isBlank ? (filledLetters.get(index) ?? "") : tile.letter))
      .join("");

    const result = await lookUpWord(filledWord, currentDictionary);
    const definition = result.definition?.split("[")[0].split(", also")[0]?.trim() ?? null;
    setLookupDefinition(definition);

    if (result.isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount(correctCount + 1);
      setSubmittedAnswer("correct");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Look up the correct word's definition for display
      const correctResult = await lookUpWord(words[wordIndex].word, currentDictionary);
      const correctDefinition =
        correctResult.definition?.split("[")[0].split(", also")[0]?.trim() ?? null;
      setLookupDefinition(correctDefinition);
      setMissedWords([...missedWords, words[wordIndex]]);
      setSubmittedAnswer("incorrect");
    }
  }

  function handleNext() {
    const nextIndex = wordIndex + 1;
    if (nextIndex < words.length) {
      setWordIndex(nextIndex);
      initializeWord(nextIndex);
    } else {
      router.replace({
        pathname: `/practice/${id}/complete`,
        params: {
          correct: String(correctCount),
          total: String(words.length),
          difficulty: currentDifficulty,
          missed: JSON.stringify(missedWords),
        },
      });
    }
  }

  const feedbackColor =
    submittedAnswer === "correct"
      ? successColor
      : submittedAnswer === "incorrect"
        ? dangerColor
        : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]} colorKey="backgroundSecondary">
      <View style={styles.headerRow} colorKey="backgroundSecondary">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quit quiz"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.quitButton}
        >
          <CloseIcon color={textSecondaryColor} />
        </Pressable>
        <ProgressBar current={wordsAttempted} total={words.length} />
        <Text style={{ ...sansSerifType.numeric, color: textSecondaryColor }}>
          {wordIndex + 1}/{words.length}
        </Text>
      </View>

      <View style={styles.clueArea} colorKey="backgroundSecondary">
        <Text
          style={{
            ...sansSerifType.sectionHeader,
            color: textSecondaryColor,
            marginBottom: 8,
          }}
        >
          Clue
        </Text>
        <Text style={[type.body, styles.clueText, { color: textColor }]}>{clue}</Text>
      </View>

      <View
        style={[
          styles.wordTilesContainer,
          { paddingBottom: bottomCardHeight + insets.bottom + 12 },
        ]}
        colorKey="backgroundSecondary"
      >
        <View style={styles.wordTilesRow} colorKey="backgroundSecondary">
          {quizWord.tiles.map((tile, index) => {
            const isBlank = tile.isBlank;
            const filled = filledLetters.get(index);
            const isSelected = isBlank && index === currentBlankTileIndex;

            let variant: TileVariant = "filled";
            if (isBlank) {
              if (submittedAnswer === "correct") {
                variant = "correct";
              } else if (submittedAnswer === "incorrect") {
                variant = "incorrect";
              } else if (filled || isSelected) {
                variant = "selected";
              } else {
                variant = "blank";
              }
            }

            if (!isBlank) {
              return <Tile key={index} letter={tile.letter} size={tileSize} />;
            }

            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={
                  filled ? `Blank filled with ${filled}` : `Empty blank ${index + 1}`
                }
                onPress={() => handleBlankTap(index)}
              >
                <Tile letter={filled} size={tileSize} variant={variant} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Animated.View
        onLayout={(event) => setBottomCardHeight(event.nativeEvent.layout.height)}
        layout={LinearTransition.duration(200).easing(Easing.out(Easing.ease))}
        style={[
          styles.bottomCard,
          {
            backgroundColor,
            borderColor: feedbackColor ?? "transparent",
            borderWidth: feedbackColor ? 2 : 0,
            bottom: insets.bottom + 12,
          },
        ]}
      >
        <View style={[styles.swapArea, { backgroundColor: "transparent" }]}>
          {submittedAnswer === null ? (
            <View style={styles.choicesContainer} colorKey="background">
              <View style={styles.choicesRow} colorKey="background">
                {choices.slice(0, 4).map((letter, index) => (
                  <ChoiceTile
                    key={index}
                    letter={letter}
                    used={usedChoiceIndices.has(index)}
                    onPress={() => handleChoiceTap(index)}
                  />
                ))}
              </View>
              <View style={styles.choicesRow} colorKey="background">
                {choices.slice(4, 7).map((letter, index) => {
                  const choiceIndex = index + 4;
                  return (
                    <ChoiceTile
                      key={choiceIndex}
                      letter={letter}
                      used={usedChoiceIndices.has(choiceIndex)}
                      onPress={() => handleChoiceTap(choiceIndex)}
                    />
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove last letter"
                  onPress={handleBackspace}
                >
                  <View
                    style={[
                      styles.backspace,
                      {
                        width: TILE_SIZE_LARGE,
                        height: TILE_SIZE_LARGE,
                        backgroundColor: backgroundSecondaryColor,
                      },
                    ]}
                  >
                    <BackspaceIcon color={textColor} size={26} />
                  </View>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.resultContent} colorKey="background">
              {submittedAnswer === "correct" ? (
                <>
                  <CheckIcon />
                  <Text style={[type.title, { marginTop: 8, color: successColor }]}>Correct</Text>
                  {lookupDefinition ? (
                    <Text
                      style={[
                        sansSerifType.subhead,
                        { color: textSecondaryColor, marginTop: 6, textAlign: "center" },
                      ]}
                    >
                      {lookupDefinition}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <XIcon />
                  <Text style={[type.title, { marginTop: 8, color: dangerColor }]}>Answer</Text>
                  <View style={styles.resultTilesRow} colorKey="background">
                    {quizWord.tiles.map((tile, index) => (
                      <Tile
                        key={index}
                        letter={tile.letter}
                        size={34}
                        showValue={false}
                        variant={tile.isBlank ? "selected" : "filled"}
                      />
                    ))}
                  </View>
                  {lookupDefinition ? (
                    <Text
                      numberOfLines={2}
                      style={[
                        sansSerifType.subhead,
                        { color: textSecondaryColor, marginTop: 8, textAlign: "center" },
                      ]}
                    >
                      {lookupDefinition}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={submittedAnswer !== null ? "Continue" : "Submit answer"}
          accessibilityState={{ disabled: submittedAnswer === null && !allBlanksFilled }}
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
          <Text
            style={[
              sansSerifType.headline,
              styles.submitButtonText,
              {
                color: submittedAnswer !== null || allBlanksFilled ? "#FFFFFF" : textSecondaryColor,
              },
            ]}
          >
            {submittedAnswer !== null ? "Continue" : "Submit"}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function ChoiceTile({
  letter,
  used,
  onPress,
}: {
  letter: string;
  used: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Letter ${letter}`}
      accessibilityState={{ disabled: used }}
      onPress={onPress}
      disabled={used}
    >
      <Tile letter={letter} size={TILE_SIZE_LARGE} variant={used ? "used" : "filled"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  quitButton: {
    padding: 2,
  },
  clueArea: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  clueText: {
    textAlign: "center",
    lineHeight: 26,
  },
  wordTilesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wordTilesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: TILE_GAP,
  },
  backspace: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTilesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  bottomCard: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  swapArea: {
    height: SWAP_AREA_HEIGHT,
    justifyContent: "center",
  },
  choicesContainer: {
    alignItems: "center",
    gap: TILE_GAP,
  },
  choicesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: TILE_GAP,
  },
  resultContent: {
    alignItems: "center",
    paddingHorizontal: 8,
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
