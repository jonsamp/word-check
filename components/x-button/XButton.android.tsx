import MaterialIcon from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";
import type { XButtonProps } from "./XButton.types";

export function XButton({ onPress, color }: XButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <MaterialIcon name="close" size={28} color={color} />
    </Pressable>
  );
}
