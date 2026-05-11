import { useColorScheme as _useColorScheme } from "react-native";

export default function useColorScheme(): "light" | "dark" {
  return _useColorScheme() === "dark" ? "dark" : "light";
}
