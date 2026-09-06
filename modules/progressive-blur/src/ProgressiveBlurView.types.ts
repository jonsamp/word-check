import type { ViewProps } from "react-native";

export type ProgressiveBlurDirection = "blurredTopClearBottom" | "blurredBottomClearTop";

export type ProgressiveBlurViewProps = ViewProps & {
  /** Blur radius at the fully blurred edge. */
  maxBlurRadius?: number;
  /** Shifts where the blur ramp begins, as a fraction of the view height. */
  startOffset?: number;
  /** Which edge holds the strongest blur. */
  direction?: ProgressiveBlurDirection;
  /** Flat color drawn over the blur. */
  tintColor?: string;
};
