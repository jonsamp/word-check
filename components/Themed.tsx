import * as React from "react";
import { Text as DefaultText, View as DefaultView } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props?: { light?: string; dark?: string }
) {
  const theme = useColorScheme();
  const colorFromProps = props && props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  colorKey?:
    | "text"
    | "textSecondary"
    | "background"
    | "backgroundSecondary"
    | "border"
    | "success"
    | "danger";
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor("text", { light: lightColor, dark: darkColor });

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, colorKey, ...otherProps } = props;
  const backgroundColor = useThemeColor(colorKey || "background", {
    light: lightColor,
    dark: darkColor,
  });

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
