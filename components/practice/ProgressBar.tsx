import React, { useEffect } from "react";
import { StyleSheet, View as RNView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useThemeColor } from "../Themed";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 3 }: ProgressBarProps) {
  const primaryColor = useThemeColor("primary");
  const backgroundSecondary = useThemeColor("backgroundSecondary");
  const fillColor = color ?? primaryColor;

  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 300,
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
    height: "100%",
    backgroundColor: fillColor,
    borderRadius: height / 2,
  }));

  return (
    <RNView
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: backgroundSecondary,
        },
      ]}
    >
      <Animated.View style={fillStyle} />
    </RNView>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
