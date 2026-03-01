import React from "react";
import { StyleSheet, View as RNView } from "react-native";

import { LetterTile, TileSize } from "./LetterTile";

interface WordDisplayProps {
  word: string;
  blankPositions: number[];
  revealedLetters: Record<number, string>;
  size?: TileSize;
  activeBlanks?: number[]; // which blank positions are currently active (pulsing)
  failedReveals?: number[]; // positions revealed due to too many wrong guesses
}

export function WordDisplay({
  word,
  blankPositions,
  revealedLetters,
  size = "large",
  activeBlanks = [],
  failedReveals = [],
}: WordDisplayProps) {
  return (
    <RNView style={styles.container}>
      {word.split("").map((letter, index) => {
        const isBlank = blankPositions.includes(index);
        const isRevealed = revealedLetters[index] !== undefined;
        const isActive = activeBlanks.includes(index);
        const isFailedReveal = failedReveals.includes(index);

        let state: "default" | "blank" | "correct" | "incorrect" = "default";
        let displayLetter = letter;

        if (isBlank && !isRevealed) {
          state = isActive ? "blank" : "blank";
          displayLetter = "";
        } else if (isBlank && isRevealed) {
          state = isFailedReveal ? "incorrect" : "correct";
          displayLetter = revealedLetters[index];
        }

        return (
          <RNView key={index} style={styles.tileWrapper}>
            <LetterTile
              letter={displayLetter}
              size={size}
              state={state}
            />
          </RNView>
        );
      })}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  tileWrapper: {
    // Individual tile wrapper for potential animations
  },
});
