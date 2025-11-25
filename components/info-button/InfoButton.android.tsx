import MaterialIcon from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";
import type { InfoButtonProps } from "./InfoButton.types";

export function InfoButton({ onPress, color }: InfoButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <MaterialIcon name="info-outline" size={28} color={color} />
    </Pressable>
  );
}
