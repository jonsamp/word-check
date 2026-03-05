export enum Difficulty {
  Level1 = "Level1",
  Level2 = "Level2",
  Level3 = "Level3",
}

export const DifficultyNames: Record<Difficulty, string> = {
  [Difficulty.Level1]: "Level I",
  [Difficulty.Level2]: "Level II",
  [Difficulty.Level3]: "Level III",
};

export const DifficultyDescriptions: Record<Difficulty, string> = {
  [Difficulty.Level1]: "One blank to fill in",
  [Difficulty.Level2]: "About half the letters are blank",
  [Difficulty.Level3]: "The maximum number of blanks",
};

export const DB_DIFFICULTY_KEY = "difficulty";
