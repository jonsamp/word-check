import { StyleSheet, View } from "react-native";

import { Text, useThemeColor } from "../Themed";
import { getLetterValue } from "../../constants/letterValues";

export type TileVariant = "filled" | "blank" | "selected" | "correct" | "incorrect" | "used";

type TileProps = {
  letter?: string;
  size?: number;
  variant?: TileVariant;
  showValue?: boolean;
};

export function Tile({ letter, size = 64, variant = "filled", showValue = true }: TileProps) {
  const tileColor = useThemeColor("tile");
  const tileTextColor = useThemeColor("tileText");
  const tileEdgeColor = useThemeColor("tileEdge");
  const backgroundSecondaryColor = useThemeColor("backgroundSecondary");
  const borderColor = useThemeColor("border");
  const tintColor = useThemeColor("tint");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  const surface = {
    filled: { background: tileColor, edge: tileEdgeColor, outline: "transparent" },
    blank: { background: backgroundSecondaryColor, edge: "transparent", outline: borderColor },
    selected: { background: `${tintColor}25`, edge: "transparent", outline: tintColor },
    correct: { background: `${successColor}25`, edge: "transparent", outline: successColor },
    incorrect: { background: `${dangerColor}25`, edge: "transparent", outline: dangerColor },
    used: { background: backgroundSecondaryColor, edge: "transparent", outline: "transparent" },
  }[variant];

  const letterColor = variant === "used" ? borderColor : tileTextColor;
  const value = letter ? getLetterValue(letter) : 0;

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.19,
          backgroundColor: surface.background,
          borderColor: surface.outline,
          borderBottomColor: surface.edge === "transparent" ? surface.outline : surface.edge,
          borderWidth: variant === "filled" ? 0 : 2,
          borderBottomWidth: variant === "filled" ? Math.max(2, size * 0.05) : 2,
        },
      ]}
    >
      {letter ? (
        <>
          <Text
            style={{
              fontFamily: "New York",
              fontSize: size * 0.46,
              fontWeight: "500",
              color: letterColor,
              lineHeight: size * 0.56,
            }}
          >
            {letter.toUpperCase()}
          </Text>
          {showValue && value > 0 && size >= 34 ? (
            <Text
              style={[
                styles.value,
                {
                  fontSize: size * 0.21,
                  color: letterColor,
                  right: size * 0.11,
                  bottom: size * 0.06,
                },
              ]}
            >
              {value}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    position: "absolute",
    fontWeight: "600",
    opacity: 0.65,
    fontVariant: ["tabular-nums"],
  },
});
