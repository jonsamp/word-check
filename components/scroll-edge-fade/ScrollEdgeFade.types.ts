import type { ComponentProps } from "react";
import type Animated from "react-native-reanimated";

import type Colors from "../../constants/Colors";

export type ScrollEdgeFadeProps = {
  /** Height of the softened band. */
  height: number;
  /** Which edge of the scroll area the band sits on. */
  edge?: "top" | "bottom";
  /** Theme color used by the gradient fallback on platforms without a native blur. */
  colorKey?: keyof typeof Colors.light;
  /** Blur radius at the strongest edge, where a native progressive blur is available. */
  maxBlurRadius?: number;
  style?: ComponentProps<typeof Animated.View>["style"];
};
