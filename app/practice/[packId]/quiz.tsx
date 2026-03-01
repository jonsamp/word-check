import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  View as RNView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInRight } from "react-native-reanimated";

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
import Layout from "../../../constants/Layout";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CHOICE_COUNT = 7;

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

function generateDistractors(
  correctLetter: string,
  validLetters: string[],
): string[] {
  // All letters that produce a valid word are "correct" -- we include the primary one
  // Pick 6 distractors from non-valid letters
  const validSet = new Set(validLetters.map((l) => l.toUpperCase()));
  const nonValid = ALPHABET.filter((l) => !validSet.has(l));

  // Weight by frequency: common letters first for plausibility
  const frequencyOrder = "EARIOTNSLUCDPMHGBFYWKVXZJQ".split("");
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  const isCorrectVowel = vowels.has(correctLetter.toUpperCase());

  // Prioritize: for vowels, include other vowels; otherwise common letters
  const sorted = nonValid.sort((a, b) => {
    const aIsVowel = vowels.has(a);
    const bIsVowel = vowels.has(b);
    if (isCorrectVowel) {
      if (aIsVowel && !bIsVowel) return -1;
      if (!aIsVowel && bIsVowel) return 1;
    }
    return frequencyOrder.indexOf(a) - frequencyOrder.indexOf(b);
  });

  return sorted.slice(0, CHOICE_COUNT - 1);
}

function saveScore(packId: string, score: number, total: number) {
  const percentage = Math.round((score / total) * 100);
  const data = JSON.stringify({ score, total, percentage });
  const key = `practice_quiz_best_${packId}`;

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
  const key = `practice_quiz_missed_${packId}`;
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

export default function QuizScreen() {
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
  const [choices, setChoices] = useState<string[]>([]);
  const [disabledChoices, setDisabledChoices] = useState<Set<string>>(
    new Set(),
  );
  const [isCorrectOnFirstTry, setIsCorrectOnFirstTry] = useState(true);
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [choiceStates, setChoiceStates] = useState<
    Record<string, "default" | "correct" | "incorrect" | "disabled">
  >({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wordKey, setWordKey] = useState(0);

  const currentWord = words[currentWordIndex] ?? "";

  const setupChoicesForPosition = useCallback(
    async (word: string, position: number) => {
      const validLetters: string[] = [];
      const correctLetter = word[position];

      // Check each letter A-Z to see if it produces a valid word
      for (const letter of ALPHABET) {
        const candidate =
          word.slice(0, position) + letter + word.slice(position + 1);
        try {
          const result = await databaseManager.lookUpWord(
            candidate,
            currentDictionary,
          );
          if (result?.isValid) {
            validLetters.push(letter);
          }
        } catch {
          // Skip on error
        }
      }

      // Ensure the correct letter is in validLetters
      if (!validLetters.includes(correctLetter)) {
        validLetters.push(correctLetter);
      }

      // Generate choices: pick the correct letter + 6 distractors
      const distractors = generateDistractors(correctLetter, validLetters);
      const allChoices = shuffleArray([correctLetter, ...distractors]);
      setChoices(allChoices);
      setDisabledChoices(new Set());
      setChoiceStates({});
    },
    [currentDictionary],
  );

  // Setup blanks for the current word
  const setupWord = useCallback(
    async (word: string) => {
      const actualBlanks = Math.min(blankCount, word.length);
      const positions = pickBlankPositions(word.length, actualBlanks);
      setBlankPositions(positions);
      setCurrentBlankIdx(0);
      setActiveBlanks(positions.length > 0 ? [positions[0]] : []);
      setRevealedLetters({});
      setDisabledChoices(new Set());
      setChoiceStates({});
      setIsCorrectOnFirstTry(true);
      setIsTransitioning(false);

      // Find valid letters for the first blank position
      if (positions.length > 0) {
        await setupChoicesForPosition(word, positions[0]);
      }
    },
    [blankCount, setupChoicesForPosition],
  );

  useEffect(() => {
    if (currentWord) {
      setupWord(currentWord);
    }
  }, [currentWordIndex, words, setupWord]);

  if (!pack) return null;

  async function handleChoiceTap(letter: string) {
    if (isTransitioning) return;
    if (disabledChoices.has(letter)) return;

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
      // If lookup fails, check against the original word's letter
      isValid = letter === currentWord[position];
    }

    if (isValid) {
      // Correct answer
      setChoiceStates((prev) => ({ ...prev, [letter]: "correct" }));
      setRevealedLetters((prev) => ({ ...prev, [position]: letter }));

      const nextBlankIdx = currentBlankIdx + 1;

      if (nextBlankIdx < blankPositions.length) {
        // More blanks to fill
        setTimeout(() => {
          setCurrentBlankIdx(nextBlankIdx);
          setActiveBlanks([blankPositions[nextBlankIdx]]);
          setupChoicesForPosition(currentWord, blankPositions[nextBlankIdx]);
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
            // Quiz complete
            const finalCorrect = isCorrectOnFirstTry
              ? correctFirstTryCount + 1
              : correctFirstTryCount;
            saveScore(packId, finalCorrect, words.length);
            saveMissedWords(packId, isCorrectOnFirstTry ? missedWords : [...missedWords, currentWord]);
            setCorrectFirstTryCount(finalCorrect);
            setIsComplete(true);
          } else {
            setCurrentWordIndex(nextWordIndex);
            setWordKey((k) => k + 1);
          }
        }, 600);
      }
    } else {
      // Incorrect answer
      setChoiceStates((prev) => ({ ...prev, [letter]: "incorrect" }));
      setDisabledChoices((prev) => new Set([...prev, letter]));
      if (isCorrectOnFirstTry) {
        setIsCorrectOnFirstTry(false);
        setMissedWords((prev) => [...prev, currentWord]);
      }

      // Reset the incorrect state after animation
      setTimeout(() => {
        setChoiceStates((prev) => ({ ...prev, [letter]: "disabled" }));
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
  const tileSize = Layout.isSmallDevice ? "medium" : "medium";

  if (isComplete) {
    const finalMissed = missedWords;
    return (
      <View style={{ flex: 1 }} colorKey="backgroundSecondary">
        <PracticeHeader title={pack.name} onBack={() => router.back()} />
        <ProgressBar progress={1} />
        <RNView style={styles.completionContainer}>
          <ModeCompletionCard
            totalWords={words.length}
            correctOnFirstTry={correctFirstTryCount}
            mode="quiz"
            onRestart={handleRestart}
            onRetryMissed={
              finalMissed.length > 0 ? handleRetryMissed : undefined
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
          />
        </Animated.View>

        <RNView style={styles.choicesContainer}>
          <RNView style={styles.choicesRow}>
            {choices.map((letter) => {
              const state = choiceStates[letter] ?? "default";
              const isDisabled = disabledChoices.has(letter);

              return (
                <LetterTile
                  key={letter}
                  letter={letter}
                  size={tileSize}
                  state={isDisabled ? "disabled" : state}
                  onPress={
                    !isDisabled && state === "default"
                      ? () => handleChoiceTap(letter)
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
    paddingHorizontal: 24,
  },
  counter: {
    ...type.callout,
    marginBottom: 32,
  },
  wordContainer: {
    marginBottom: 48,
  },
  choicesContainer: {
    alignItems: "center",
  },
  choicesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
