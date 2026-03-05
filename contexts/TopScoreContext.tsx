import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import Storage from "expo-sqlite/kv-store";
import { Difficulty } from "../constants/difficulty";

const STORAGE_KEY = "topScores";

type ScoresByDifficulty = Partial<Record<Difficulty, number>>;
type ScoresMap = Record<string, ScoresByDifficulty>;

interface TopScoreContextType {
  getTopScore(listId: string, difficulty: Difficulty): number | null;
  saveScore(listId: string, difficulty: Difficulty, percentage: number): void;
}

const TopScoreContext = createContext<TopScoreContextType | undefined>(undefined);

function migrateScores(raw: Record<string, unknown>): ScoresMap {
  const migrated: ScoresMap = {};
  for (const [listId, value] of Object.entries(raw)) {
    if (typeof value === "number") {
      // Old format: plain number → treat as Level1
      migrated[listId] = { [Difficulty.Level1]: value };
    } else if (typeof value === "object" && value !== null) {
      migrated[listId] = value as ScoresByDifficulty;
    }
  }
  return migrated;
}

export function TopScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<ScoresMap>({});
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    let stored: string | null = null;
    if (isWeb) {
      stored = localStorage.getItem(STORAGE_KEY);
    } else {
      stored = Storage.getItemSync(STORAGE_KEY);
    }
    if (stored) {
      try {
        setScores(migrateScores(JSON.parse(stored)));
      } catch {
        // ignore corrupt data
      }
    }
  }, [isWeb]);

  function persist(updated: ScoresMap) {
    const json = JSON.stringify(updated);
    if (isWeb) {
      localStorage.setItem(STORAGE_KEY, json);
    } else {
      Storage.setItemSync(STORAGE_KEY, json);
    }
  }

  function getTopScore(listId: string, difficulty: Difficulty): number | null {
    return scores[listId]?.[difficulty] ?? null;
  }

  function saveScore(listId: string, difficulty: Difficulty, percentage: number) {
    const existing = scores[listId]?.[difficulty];
    if (existing !== undefined && existing >= percentage) {
      return;
    }
    const updated: ScoresMap = {
      ...scores,
      [listId]: { ...scores[listId], [difficulty]: percentage },
    };
    setScores(updated);
    persist(updated);
  }

  return (
    <TopScoreContext.Provider value={{ getTopScore, saveScore }}>
      {children}
    </TopScoreContext.Provider>
  );
}

export function useTopScores() {
  const context = useContext(TopScoreContext);
  if (context === undefined) {
    throw new Error("useTopScores must be used within a TopScoreProvider");
  }
  return context;
}
