import type { ProgressiveBlurViewProps } from "./ProgressiveBlurView.types";

/**
 * The variable blur filter this module drives only exists on iOS, so every other
 * platform renders nothing and callers fall back to their own treatment.
 */
export function ProgressiveBlurView(_props: ProgressiveBlurViewProps) {
  return null;
}
