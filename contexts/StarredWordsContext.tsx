import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import Storage from "expo-sqlite/kv-store";

import { PracticeWord } from "../constants/PracticeLists";

const STORAGE_KEY = "starredWords";

type StarredMap = Record<string, PracticeWord>;

interface StarredWordsContextType {
  starredWords: PracticeWord[];
  isStarred(word: string): boolean;
  toggleStar(entry: PracticeWord): void;
}

const StarredWordsContext = createContext<StarredWordsContextType | undefined>(undefined);

export function StarredWordsProvider({ children }: { children: ReactNode }) {
  const [starred, setStarred] = useState<StarredMap>({});
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
        setStarred(JSON.parse(stored));
      } catch {
        // ignore corrupt data
      }
    }
  }, [isWeb]);

  function persist(updated: StarredMap) {
    const json = JSON.stringify(updated);
    if (isWeb) {
      localStorage.setItem(STORAGE_KEY, json);
    } else {
      Storage.setItemSync(STORAGE_KEY, json);
    }
  }

  function isStarred(word: string) {
    return starred[word.toUpperCase()] !== undefined;
  }

  function toggleStar(entry: PracticeWord) {
    const key = entry.word.toUpperCase();
    const updated = { ...starred };

    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = { word: key, definition: entry.definition };
    }

    setStarred(updated);
    persist(updated);
  }

  const starredWords = Object.values(starred).sort((first, second) =>
    first.word.localeCompare(second.word)
  );

  return (
    <StarredWordsContext.Provider value={{ starredWords, isStarred, toggleStar }}>
      {children}
    </StarredWordsContext.Provider>
  );
}

export function useStarredWords() {
  const context = useContext(StarredWordsContext);
  if (context === undefined) {
    throw new Error("useStarredWords must be used within a StarredWordsProvider");
  }
  return context;
}
