import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useThemeColor } from "../Themed";

type ProgressBarProps = {
  current: number;
  total: number;
  height?: number;
};

export function ProgressBar({ current, total, height = 8 }: ProgressBarProps) {
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");

  const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${ratio * 100}%`, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: borderColor }]}
    >
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { height, borderRadius: height / 2, backgroundColor: tintColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
