import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  View as RNView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import { View, Text, useThemeColor } from "../../../components/Themed";
import { type } from "../../../constants/Type";
import { getPackById } from "../../../constants/packs";
import { PracticeHeader } from "../../../components/practice/PracticeHeader";
import { ProgressBar } from "../../../components/practice/ProgressBar";
import { WordDisplay } from "../../../components/practice/WordDisplay";
import { LetterTile } from "../../../components/practice/LetterTile";
import { ModeCompletionCard } from "../../../components/practice/ModeCompletionCard";
import { databaseManager } from "../../../constants/database";
import { useDictionary } from "../../../contexts/DictionaryContext";

const ALPHABET_ROW1 = "ABCDEFGHIJKLM".split("");
const ALPHABET_ROW2 = "NOPQRSTUVWXYZ".split("");

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickBlankPositions(wordLength: number, blankCount: number): number[] {
  const positions: number[] = [];
  const available = Array.from({ length: wordLength }, (_, i) => i);
  const shuffled = shuffleArray(available);
  const count = Math.min(blankCount, wordLength);
  for (let i = 0; i < count; i++) {
    positions.push(shuffled[i]);
  }
  return positions.sort((a, b) => a - b);
}

function saveScore(packId: string, score: number, total: number) {
  const percentage = Math.round((score / total) * 100);
  const data = JSON.stringify({ score, total, percentage });
  const key = `practice_freetype_best_${packId}`;

  try {
    if (Platform.OS === "web") {
      const existing = localStorage.getItem(key);
      if (existing) {
        const prev = JSON.parse(existing);
        if (prev.percentage >= percentage) return;
      }
      localStorage.setItem(key, data);
    } else {
      const Storage = require("expo-sqlite/kv-store").default;
      const existing = Storage.getItemSync(key);
      if (existing) {
        const prev = JSON.parse(existing);
        if (prev.percentage >= percentage) return;
      }
      Storage.setItemSync(key, data);
    }
  } catch {
    // Silently fail
  }
}

function saveMissedWords(packId: string, missed: string[]) {
  const key = `practice_freetype_missed_${packId}`;
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, JSON.stringify(missed));
    } else {
      const Storage = require("expo-sqlite/kv-store").default;
      Storage.setItemSync(key, JSON.stringify(missed));
    }
  } catch {
    // Silently fail
  }
}

export default function FreeTypeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { packId, blanks: blanksParam } = useLocalSearchParams<{
    packId: string;
    blanks: string;
  }>();
  const { currentDictionary } = useDictionary();

  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");

  const pack = getPackById(packId);
  const blankCount = parseInt(blanksParam ?? "1", 10) || 1;

  const [words, setWords] = useState<string[]>(() =>
    shuffleArray(pack?.words ?? []),
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [blankPositions, setBlankPositions] = useState<number[]>([]);
  const [activeBlanks, setActiveBlanks] = useState<number[]>([]);
  const [currentBlankIdx, setCurrentBlankIdx] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<
    Record<number, string>
  >({});
  const [failedReveals, setFailedReveals] = useState<number[]>([]);
  const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());
  const [keyStates, setKeyStates] = useState<
    Record<string, "default" | "correct" | "incorrect" | "disabled">
  >({});
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintDefinition, setHintDefinition] = useState("");
  const [isCorrectOnFirstTry, setIsCorrectOnFirstTry] = useState(true);
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wordKey, setWordKey] = useState(0);

  const currentWord = words[currentWordIndex] ?? "";

  // Fetch definition for hint
  const fetchDefinition = useCallback(
    async (word: string) => {
      try {
        const result = await databaseManager.lookUpWord(
          word,
          currentDictionary,
        );
        if (result?.definition) {
          const def =
            result.definition.split("[")[0].split(", also")[0]?.trim() ?? "";
          return def;
        }
      } catch {
        // Skip
      }
      return "";
    },
    [currentDictionary],
  );

  const setupWord = useCallback(
    (word: string) => {
      const actualBlanks = Math.min(blankCount, word.length);
      const positions = pickBlankPositions(word.length, actualBlanks);
      setBlankPositions(positions);
      setCurrentBlankIdx(0);
      setActiveBlanks(positions.length > 0 ? [positions[0]] : []);
      setRevealedLetters({});
      setFailedReveals([]);
      setDisabledKeys(new Set());
      setKeyStates({});
      setWrongGuessCount(0);
      setShowHint(false);
      setHintDefinition("");
      setIsCorrectOnFirstTry(true);
      setIsTransitioning(false);
    },
    [blankCount],
  );

  useEffect(() => {
    if (currentWord) {
      setupWord(currentWord);
    }
  }, [currentWordIndex, words]);

  if (!pack) return null;

  function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async function handleKeyTap(letter: string) {
    if (isTransitioning) return;
    if (disabledKeys.has(letter)) return;

    const position = blankPositions[currentBlankIdx];
    if (position === undefined) return;

    // Check if this letter produces a valid word at this position
    const candidate =
      currentWord.slice(0, position) + letter + currentWord.slice(position + 1);
    let isValid = false;
    try {
      const result = await databaseManager.lookUpWord(
        candidate,
        currentDictionary,
      );
      isValid = result?.isValid ?? false;
    } catch {
      isValid = letter === currentWord[position];
    }

    if (isValid) {
      // Correct
      setKeyStates((prev) => ({ ...prev, [letter]: "correct" }));
      setRevealedLetters((prev) => ({ ...prev, [position]: letter }));

      const nextBlankIdx = currentBlankIdx + 1;

      if (nextBlankIdx < blankPositions.length) {
        // More blanks to fill
        setTimeout(() => {
          setCurrentBlankIdx(nextBlankIdx);
          setActiveBlanks([blankPositions[nextBlankIdx]]);
          setDisabledKeys(new Set());
          setKeyStates({});
          setWrongGuessCount(0);
          setShowHint(false);
        }, 600);
      } else {
        // All blanks filled -- move to next word
        if (isCorrectOnFirstTry) {
          setCorrectFirstTryCount((c) => c + 1);
        }

        setIsTransitioning(true);
        setTimeout(() => {
          const nextWordIndex = currentWordIndex + 1;
          if (nextWordIndex >= words.length) {
            // Complete
            const finalCorrect = isCorrectOnFirstTry
              ? correctFirstTryCount + 1
              : correctFirstTryCount;
            saveScore(packId, finalCorrect, words.length);
            saveMissedWords(
              packId,
              isCorrectOnFirstTry
                ? missedWords
                : [...missedWords, currentWord],
            );
            setCorrectFirstTryCount(finalCorrect);
            setIsComplete(true);
          } else {
            setCurrentWordIndex(nextWordIndex);
            setWordKey((k) => k + 1);
          }
        }, 600);
      }
    } else {
      // Incorrect
      setKeyStates((prev) => ({ ...prev, [letter]: "incorrect" }));
      setDisabledKeys((prev) => new Set([...prev, letter]));
      const newWrongCount = wrongGuessCount + 1;
      setWrongGuessCount(newWrongCount);

      if (isCorrectOnFirstTry) {
        setIsCorrectOnFirstTry(false);
        setMissedWords((prev) => [...prev, currentWord]);
      }

      // Show hint after 3 wrong guesses
      if (newWrongCount >= 3 && !showHint) {
        setShowHint(true);
        fetchDefinition(currentWord).then((def) => {
          if (def) setHintDefinition(def);
        });
      }

      // Auto-reveal after 5 wrong guesses
      if (newWrongCount >= 5) {
        const correctLetter = currentWord[position];
        setRevealedLetters((prev) => ({
          ...prev,
          [position]: correctLetter,
        }));
        setFailedReveals((prev) => [...prev, position]);

        const nextBlankIdx = currentBlankIdx + 1;

        if (nextBlankIdx < blankPositions.length) {
          setTimeout(() => {
            setCurrentBlankIdx(nextBlankIdx);
            setActiveBlanks([blankPositions[nextBlankIdx]]);
            setDisabledKeys(new Set());
            setKeyStates({});
            setWrongGuessCount(0);
            setShowHint(false);
          }, 800);
        } else {
          // All blanks done, move on
          setIsTransitioning(true);
          setTimeout(() => {
            const nextWordIndex = currentWordIndex + 1;
            if (nextWordIndex >= words.length) {
              saveScore(packId, correctFirstTryCount, words.length);
              saveMissedWords(packId, missedWords);
              setIsComplete(true);
            } else {
              setCurrentWordIndex(nextWordIndex);
              setWordKey((k) => k + 1);
            }
          }, 800);
        }
      }

      // Reset key visual state after animation
      setTimeout(() => {
        setKeyStates((prev) => ({ ...prev, [letter]: "disabled" }));
      }, 500);
    }
  }

  function handleRestart() {
    const newWords = shuffleArray(pack!.words);
    setWords(newWords);
    setCurrentWordIndex(0);
    setCorrectFirstTryCount(0);
    setMissedWords([]);
    setIsComplete(false);
    setWordKey((k) => k + 1);
  }

  function handleRetryMissed() {
    const missed = [...missedWords];
    setWords(shuffleArray(missed));
    setCurrentWordIndex(0);
    setCorrectFirstTryCount(0);
    setMissedWords([]);
    setIsComplete(false);
    setWordKey((k) => k + 1);
  }

  const progress =
    words.length > 0 ? (currentWordIndex + 1) / words.length : 0;

  if (isComplete) {
    return (
      <View style={{ flex: 1 }} colorKey="backgroundSecondary">
        <PracticeHeader title={pack.name} onBack={() => router.back()} />
        <ProgressBar progress={1} />
        <RNView style={styles.completionContainer}>
          <ModeCompletionCard
            totalWords={words.length}
            correctOnFirstTry={correctFirstTryCount}
            mode="freetype"
            onRestart={handleRestart}
            onRetryMissed={
              missedWords.length > 0 ? handleRetryMissed : undefined
            }
            onBack={() => router.back()}
          />
        </RNView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} colorKey="backgroundSecondary">
      <PracticeHeader title={pack.name} onBack={() => router.back()} />
      <ProgressBar progress={progress} />

      <RNView style={styles.contentContainer}>
        <Text style={[styles.counter, { color: textSecondaryColor }]}>
          {currentWordIndex + 1} of {words.length}
        </Text>

        <Animated.View
          key={`word-${wordKey}`}
          entering={FadeInRight.duration(300)}
          style={styles.wordContainer}
        >
          <WordDisplay
            word={currentWord}
            blankPositions={blankPositions}
            revealedLetters={revealedLetters}
            size="large"
            activeBlanks={activeBlanks}
            failedReveals={failedReveals}
          />
        </Animated.View>

        {showHint && !!hintDefinition && (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.hintContainer}
          >
            <Text
              style={[styles.hintText, { color: textSecondaryColor }]}
              numberOfLines={3}
            >
              {capitalizeFirstLetter(hintDefinition)}.
            </Text>
          </Animated.View>
        )}

        <RNView
          style={[
            styles.keyboardContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <RNView style={styles.keyboardRow}>
            {ALPHABET_ROW1.map((letter) => {
              const state = keyStates[letter] ?? "default";
              const isDisabled = disabledKeys.has(letter);

              return (
                <LetterTile
                  key={letter}
                  letter={letter}
                  size="small"
                  state={isDisabled ? "disabled" : state}
                  onPress={
                    !isDisabled && state === "default"
                      ? () => handleKeyTap(letter)
                      : undefined
                  }
                />
              );
            })}
          </RNView>
          <RNView style={styles.keyboardRow}>
            {ALPHABET_ROW2.map((letter) => {
              const state = keyStates[letter] ?? "default";
              const isDisabled = disabledKeys.has(letter);

              return (
                <LetterTile
                  key={letter}
                  letter={letter}
                  size="small"
                  state={isDisabled ? "disabled" : state}
                  onPress={
                    !isDisabled && state === "default"
                      ? () => handleKeyTap(letter)
                      : undefined
                  }
                />
              );
            })}
          </RNView>
        </RNView>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  counter: {
    ...type.callout,
    marginBottom: 32,
  },
  wordContainer: {
    marginBottom: 32,
  },
  hintContainer: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  hintText: {
    ...type.body,
    textAlign: "center",
    lineHeight: 24,
  },
  keyboardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  keyboardRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
