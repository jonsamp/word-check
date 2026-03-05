import { generateQuizWord, generateChoices } from "../quiz";
import { Difficulty } from "../difficulty";

describe("generateQuizWord", () => {
  it("Level I always produces exactly 1 blank", () => {
    for (let run = 0; run < 20; run++) {
      const result = generateQuizWord("TESTING", Difficulty.Level1);
      expect(result.blanks).toHaveLength(1);
      expect(result.tiles.filter((tile) => tile.isBlank)).toHaveLength(1);
    }
  });

  it("Level II produces ~half blanks", () => {
    // TESTING = 7 letters, all blankable → round(7/2) = 4
    for (let run = 0; run < 20; run++) {
      const result = generateQuizWord("TESTING", Difficulty.Level2);
      expect(result.blanks).toHaveLength(4);
    }
  });

  it("Level III produces max blanks (blankable - 1)", () => {
    // TESTING = 7 letters, all blankable → 7 - 1 = 6
    for (let run = 0; run < 20; run++) {
      const result = generateQuizWord("TESTING", Difficulty.Level3);
      expect(result.blanks).toHaveLength(6);
    }
  });

  it("required letters are never blanked", () => {
    for (let run = 0; run < 30; run++) {
      const result = generateQuizWord("AQUA", Difficulty.Level3, ["Q"]);
      const qTiles = result.tiles.filter((tile) => tile.letter === "Q");
      for (const tile of qTiles) {
        expect(tile.isBlank).toBe(false);
      }
    }
  });

  it("word field matches input", () => {
    const result = generateQuizWord("HELLO", Difficulty.Level1);
    expect(result.word).toBe("HELLO");
  });

  it("blanks array length matches number of blank tiles", () => {
    const result = generateQuizWord("TESTING", Difficulty.Level2);
    const blankTiles = result.tiles.filter((tile) => tile.isBlank);
    expect(result.blanks).toHaveLength(blankTiles.length);
  });

  it("tiles array length matches word length", () => {
    const result = generateQuizWord("QUIZ", Difficulty.Level1);
    expect(result.tiles).toHaveLength(4);
  });

  it("word with 0 blankable positions returns no blanks", () => {
    const result = generateQuizWord("QQ", Difficulty.Level3, ["Q"]);
    expect(result.blanks).toHaveLength(0);
    expect(result.tiles.every((tile) => !tile.isBlank)).toBe(true);
  });

  it("2-letter word produces 1 blank at all levels", () => {
    for (const difficulty of [Difficulty.Level1, Difficulty.Level2, Difficulty.Level3]) {
      for (let run = 0; run < 10; run++) {
        const result = generateQuizWord("AB", difficulty);
        expect(result.blanks).toHaveLength(1);
      }
    }
  });
});

describe("generateChoices", () => {
  it("result always has length 7 by default", () => {
    const result = generateChoices(["A", "B", "C"]);
    expect(result).toHaveLength(7);
  });

  it("all blank letters are present in the result", () => {
    const blanks = ["X", "Y", "Z"];
    for (let run = 0; run < 20; run++) {
      const result = generateChoices(blanks);
      for (const letter of blanks) {
        expect(result).toContain(letter);
      }
    }
  });

  it("custom totalChoices works", () => {
    const result = generateChoices(["A", "B"], 10);
    expect(result).toHaveLength(10);
    expect(result).toContain("A");
    expect(result).toContain("B");
  });

  it("empty blanks array returns 7 random letters", () => {
    const result = generateChoices([]);
    expect(result).toHaveLength(7);
    for (const letter of result) {
      expect(letter).toMatch(/^[A-Z]$/);
    }
  });

  it("when blanks exceed totalChoices, returns all blanks shuffled", () => {
    const blanks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const result = generateChoices(blanks, 5);
    expect(result).toHaveLength(10);
    expect(result.sort()).toEqual(blanks.sort());
  });
});
