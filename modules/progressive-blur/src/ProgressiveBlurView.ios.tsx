import { requireNativeView } from "expo";

import type { ProgressiveBlurViewProps } from "./ProgressiveBlurView.types";

const NativeProgressiveBlurView =
  requireNativeView<ProgressiveBlurViewProps>("ProgressiveBlurView");

export function ProgressiveBlurView({
  direction = "blurredTopClearBottom",
  maxBlurRadius = 18,
  startOffset = -0.06,
  tintColor = "transparent",
  style,
  ...rest
}: ProgressiveBlurViewProps) {
  return (
    <NativeProgressiveBlurView
      {...rest}
      direction={direction}
      maxBlurRadius={maxBlurRadius}
      startOffset={startOffset}
      style={style}
      tintColor={tintColor}
    />
  );
}
