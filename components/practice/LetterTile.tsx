import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text, useThemeColor } from "../Themed";
import { type } from "../../constants/Type";
import Layout from "../../constants/Layout";

export type TileSize = "small" | "medium" | "large";
export type TileState =
  | "default"
  | "blank"
  | "correct"
  | "incorrect"
  | "disabled";

interface LetterTileProps {
  letter: string;
  size?: TileSize;
  state?: TileState;
  onPress?: () => void;
}

const SIZES: Record<TileSize, number> = {
  small: Layout.isSmallDevice ? 28 : 32,
  medium: Layout.isSmallDevice ? 40 : 44,
  large: Layout.isSmallDevice ? 48 : 56,
};

export function LetterTile({
  letter,
  size = "medium",
  state = "default",
  onPress,
}: LetterTileProps) {
  const backgroundColor = useThemeColor("backgroundSecondary");
  const textColor = useThemeColor("text");
  const textSecondaryColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");
  const bgColor = useThemeColor("background");

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const flashColor = useSharedValue(0); // 0 = success, 1 = danger

  useEffect(() => {
    if (state === "blank") {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 800 }),
          withTiming(1.0, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, { duration: 100 });
    }
  }, [state]);

  useEffect(() => {
    if (state === "correct") {
      flashColor.value = 0;
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 200 }),
      );
    } else if (state === "incorrect") {
      flashColor.value = 1;
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 200 }),
      );
      translateX.value = withSequence(
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(2, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor:
      flashColor.value === 0 ? successColor : dangerColor,
    opacity: flashOpacity.value,
  }));

  const dimension = SIZES[size];
  const fontSize =
    size === "large"
      ? type.titleTwo.fontSize
      : size === "medium"
        ? type.headline.fontSize
        : type.callout.fontSize;

  const isBlank = state === "blank";
  const isDisabled = state === "disabled";

  const tileStyle = [
    styles.tile,
    {
      width: dimension,
      height: dimension,
      borderRadius: 8,
      backgroundColor: isBlank ? "transparent" : backgroundColor,
      borderWidth: isBlank ? 2 : StyleSheet.hairlineWidth,
      borderColor: borderColor,
      borderStyle: isBlank ? ("dashed" as const) : ("solid" as const),
      opacity: isDisabled ? 0.3 : 1,
    },
  ];

  const letterColor =
    state === "correct" || state === "incorrect" ? bgColor : textColor;

  const content = (
    <Animated.View style={[tileStyle, animatedStyle]}>
      <Animated.View style={flashStyle} />
      {!!letter && (
        <Text
          style={[
            styles.letter,
            {
              fontFamily: type.headline.fontFamily,
              fontSize,
              fontWeight: "bold",
              color: isDisabled ? textSecondaryColor : letterColor,
            },
          ]}
        >
          {letter}
        </Text>
      )}
    </Animated.View>
  );

  if (onPress && !isDisabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  letter: {
    textAlign: "center",
  },
});
