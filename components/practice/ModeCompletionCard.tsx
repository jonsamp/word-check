import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Text, useThemeColor } from "../Themed";
import { CheckIcon } from "../Icons";
import { type } from "../../constants/Type";

interface ModeCompletionCardProps {
  totalWords: number;
  correctOnFirstTry?: number;
  onRestart: () => void;
  onRetryMissed?: () => void;
  onBack: () => void;
  mode?: "flashcard" | "quiz" | "freetype";
}

export function ModeCompletionCard({
  totalWords,
  correctOnFirstTry,
  onRestart,
  onRetryMissed,
  onBack,
  mode = "flashcard",
}: ModeCompletionCardProps) {
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const backgroundColor = useThemeColor("background");
  const borderColor = useThemeColor("border");

  const isFlashcard = mode === "flashcard";
  const percentage =
    correctOnFirstTry !== undefined
      ? Math.round((correctOnFirstTry / totalWords) * 100)
      : null;
  const hasMissed =
    correctOnFirstTry !== undefined && correctOnFirstTry < totalWords;

  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <RNView style={styles.content}>
        <RNView style={styles.iconContainer}>
          <CheckIcon />
        </RNView>

        {isFlashcard ? (
          <>
            <Text style={[styles.mainText, { color: textColor }]}>
              All {totalWords} words
            </Text>
            <Text style={[styles.subText, { color: textSecondaryColor }]}>
              reviewed
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.mainText, { color: textColor }]}>
              {correctOnFirstTry} of {totalWords}
            </Text>
            <Text style={[styles.subText, { color: textSecondaryColor }]}>
              correct on first try
            </Text>
            {percentage !== null && (
              <Text style={[styles.percentage, { color: textColor }]}>
                {percentage}%
              </Text>
            )}
          </>
        )}

        <RNView style={styles.buttons}>
          {hasMissed && onRetryMissed && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: textColor }]}
              onPress={onRetryMissed}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryButtonText, { color: backgroundColor }]}>
                Try missed words
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              isFlashcard || !hasMissed
                ? [styles.primaryButton, { backgroundColor: textColor }]
                : styles.ghostButton,
            ]}
            onPress={onRestart}
            activeOpacity={0.7}
          >
            <Text
              style={[
                isFlashcard || !hasMissed
                  ? [styles.primaryButtonText, { color: backgroundColor }]
                  : [styles.ghostButtonText, { color: textColor }],
              ]}
            >
              {isFlashcard ? "Review again" : "Restart all"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.ghostButtonText, { color: textColor }]}>
              Back to pack
            </Text>
          </TouchableOpacity>
        </RNView>
      </RNView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  mainText: {
    ...type.titleOne,
    fontWeight: "bold",
    textAlign: "center",
  },
  subText: {
    ...type.body,
    marginTop: 4,
    textAlign: "center",
  },
  percentage: {
    ...type.largeTitle,
    fontWeight: "bold",
    marginTop: 16,
  },
  buttons: {
    marginTop: 32,
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
  },
  primaryButtonText: {
    ...type.headline,
    fontWeight: "bold",
  },
  ghostButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
  },
  ghostButtonText: {
    ...type.headline,
  },
});
