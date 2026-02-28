import { TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";

import type { InfoButtonProps } from "./InfoButton.types";

export function InfoButton({ onPress, color }: InfoButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 12 }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm1.5 10h-3v-1.5h.75v-3H10.5V10.5h2.25v4.5h.75V16.5z"
          fill={color || "#000"}
        />
      </Svg>
    </TouchableOpacity>
  );
}
