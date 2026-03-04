import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import Storage from "expo-sqlite/kv-store";

const STORAGE_KEY = "topScores";

interface TopScoreContextType {
  getTopScore(listId: string): number | null;
  saveScore(listId: string, percentage: number): void;
}

const TopScoreContext = createContext<TopScoreContextType | undefined>(undefined);

export function TopScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<Record<string, number>>({});
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
        setScores(JSON.parse(stored));
      } catch {
        // ignore corrupt data
      }
    }
  }, [isWeb]);

  function persist(updated: Record<string, number>) {
    const json = JSON.stringify(updated);
    if (isWeb) {
      localStorage.setItem(STORAGE_KEY, json);
    } else {
      Storage.setItemSync(STORAGE_KEY, json);
    }
  }

  function getTopScore(listId: string): number | null {
    return scores[listId] ?? null;
  }

  function saveScore(listId: string, percentage: number) {
    const existing = scores[listId];
    if (existing !== undefined && existing >= percentage) {
      return;
    }
    const updated = { ...scores, [listId]: percentage };
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
