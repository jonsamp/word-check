import { Difficulty } from "./difficulty";

export type Tile = {
  letter: string;
  isBlank: boolean;
};

export type QuizWord = {
  word: string;
  tiles: Tile[];
  blanks: string[];
};

export function generateQuizWord(
  word: string,
  difficulty: Difficulty,
  requiredLetters?: string[]
): QuizWord {
  const letters = word.split("");
  const required = new Set(requiredLetters ?? []);

  const blankableIndices = letters.reduce<number[]>((acc, letter, index) => {
    if (!required.has(letter)) {
      acc.push(index);
    }
    return acc;
  }, []);

  if (blankableIndices.length === 0) {
    return {
      word,
      tiles: letters.map((letter) => ({ letter, isBlank: false })),
      blanks: [],
    };
  }

  let blankCount: number;
  switch (difficulty) {
    case Difficulty.Level1:
      blankCount = 1;
      break;
    case Difficulty.Level2:
      blankCount = Math.max(1, Math.round(blankableIndices.length / 2));
      break;
    case Difficulty.Level3:
      blankCount = Math.max(1, blankableIndices.length - 1);
      break;
  }

  // Shuffle blankable indices and pick the first `blankCount`
  const shuffled = [...blankableIndices];
  for (let current = shuffled.length - 1; current > 0; current--) {
    const swapWith = Math.floor(Math.random() * (current + 1));
    [shuffled[current], shuffled[swapWith]] = [shuffled[swapWith], shuffled[current]];
  }
  const blankSet = new Set(shuffled.slice(0, blankCount));

  const tiles = letters.map((letter, index) => ({
    letter,
    isBlank: blankSet.has(index),
  }));

  const blanks = tiles.filter((tile) => tile.isBlank).map((tile) => tile.letter);

  return { word, tiles, blanks };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let current = shuffled.length - 1; current > 0; current--) {
    const swapWith = Math.floor(Math.random() * (current + 1));
    [shuffled[current], shuffled[swapWith]] = [shuffled[swapWith], shuffled[current]];
  }
  return shuffled;
}

export function generateChoices(requiredLetters: string[], totalChoices: number = 7): string[] {
  if (requiredLetters.length >= totalChoices) {
    return shuffleArray(requiredLetters);
  }

  const choices = [...requiredLetters];
  const fillerCount = totalChoices - requiredLetters.length;
  for (let index = 0; index < fillerCount; index++) {
    const code = Math.floor(Math.random() * 26) + 65;
    choices.push(String.fromCharCode(code));
  }

  return shuffleArray(choices);
}
