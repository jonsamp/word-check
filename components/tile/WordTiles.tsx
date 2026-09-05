import { StyleSheet, View } from "react-native";

import { Tile } from "./Tile";

type WordTilesProps = {
  word: string;
  size?: number;
  showValues?: boolean;
};

export function WordTiles({ word, size, showValues = true }: WordTilesProps) {
  const letters = word.toUpperCase().split("");
  const resolvedSize = size ?? (letters.length > 7 ? 40 : letters.length > 5 ? 50 : 62);

  return (
    <View style={styles.row}>
      {letters.map((letter, index) => (
        <Tile
          key={`${letter}-${index}`}
          letter={letter}
          size={resolvedSize}
          showValue={showValues}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
});
