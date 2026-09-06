import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

/**
 * Reveals a fade overlay as soon as content starts sliding under the edge, so
 * the overlay never dims content while the list sits at rest.
 */
export function useScrollFade(fadeHeight: number) {
  const scrollOffset = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, fadeHeight], [0, 1], Extrapolation.CLAMP),
  }));

  return { onScroll, fadeStyle };
}
