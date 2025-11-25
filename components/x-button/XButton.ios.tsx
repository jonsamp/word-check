import { Host, Button, Image as SwiftUIImage } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

import type { XButtonProps } from "./XButton.types";

export function XButton({ onPress, color }: XButtonProps) {
  return (
    <Host matchContents>
      <Button
        modifiers={[
          padding({ all: 12 }),
          glassEffect({
            glass: {
              variant: "clear",
              interactive: true,
            },
            shape: "circle",
          }),
        ]}
        onPress={onPress}
      >
        <SwiftUIImage systemName="xmark" size={20} color={color} />
      </Button>
    </Host>
  );
}
