import { Pressable, StyleSheet } from "react-native";

import type { XButtonProps } from "./XButton.types";

export function XButton({ onPress, color }: XButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke={color ?? "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <line x1="2" y1="2" x2="14" y2="14" />
        <line x1="14" y1="2" x2="2" y2="14" />
      </svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 100,
  },
});
