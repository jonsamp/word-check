import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Defs, LinearGradient, Rect, Stop, Svg } from "react-native-svg";

import Colors from "../../constants/Colors";
import useColorScheme from "../../hooks/useColorScheme";
import type { ScrollEdgeFadeProps } from "./ScrollEdgeFade.types";

/**
 * Platforms without the iOS variable blur filter get a gradient wash in the
 * background color instead.
 */
export function ScrollEdgeFade({
  height,
  edge = "top",
  colorKey = "backgroundSecondary",
  style,
}: ScrollEdgeFadeProps) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme][colorKey];
  const isTop = edge === "top";
  const gradientId = `scroll-edge-fade-${edge}`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { height }, isTop ? { top: 0 } : { bottom: 0 }, style]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0"
            y1={isTop ? "0" : "1"}
            x2="0"
            y2={isTop ? "1" : "0"}
          >
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="0.6" stopColor={color} stopOpacity="0.75" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
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
