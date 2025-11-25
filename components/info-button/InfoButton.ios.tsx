import { Host, Button, Image as SwiftUIImage } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

import type { InfoButtonProps } from "./InfoButton.types";

export function InfoButton({ onPress, color }: InfoButtonProps) {
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
        <SwiftUIImage systemName="info.circle" size={20} color={color} />
      </Button>
    </Host>
  );
}
