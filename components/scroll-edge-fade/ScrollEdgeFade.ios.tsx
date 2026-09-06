import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { ProgressiveBlurView } from "../../modules/progressive-blur";
import type { ScrollEdgeFadeProps } from "./ScrollEdgeFade.types";

export function ScrollEdgeFade({
  height,
  edge = "top",
  maxBlurRadius = 16,
  style,
}: ScrollEdgeFadeProps) {
  const isTop = edge === "top";

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { height }, isTop ? { top: 0 } : { bottom: 0 }, style]}
    >
      <ProgressiveBlurView
        style={StyleSheet.absoluteFill}
        direction={isTop ? "blurredTopClearBottom" : "blurredBottomClearTop"}
        maxBlurRadius={maxBlurRadius}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
