import { type ReactNode, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type CollapsibleProps = {
  expanded: boolean;
  duration?: number;
  children: ReactNode;
};

/**
 * Animates between zero height and the natural height of its children. The
 * children are positioned absolutely so the animated height never squeezes
 * them, which keeps the measured height stable while the animation runs.
 */
export function Collapsible({ expanded, duration = 260, children }: CollapsibleProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, duration, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    height: contentHeight * progress.value,
    opacity: progress.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View
        style={styles.content}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
});
