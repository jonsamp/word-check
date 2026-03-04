import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import Storage from "expo-sqlite/kv-store";
import { DB_DIFFICULTY_KEY, Difficulty } from "../constants/difficulty";

interface DifficultyContextType {
  currentDifficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

const DifficultyContext = createContext<DifficultyContextType | undefined>(undefined);

export function DifficultyProvider({ children }: { children: ReactNode }) {
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(Difficulty.Level1);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    let storedDifficulty: string | null = null;
    if (isWeb) {
      storedDifficulty = localStorage.getItem(DB_DIFFICULTY_KEY);
    } else {
      storedDifficulty = Storage.getItemSync(DB_DIFFICULTY_KEY);
    }
    if (storedDifficulty) {
      setCurrentDifficulty(storedDifficulty as Difficulty);
    }
  }, [isWeb]);

  function setDifficulty(difficulty: Difficulty) {
    if (difficulty === currentDifficulty) {
      return;
    }

    setCurrentDifficulty(difficulty);
    if (isWeb) {
      localStorage.setItem(DB_DIFFICULTY_KEY, difficulty);
    } else {
      Storage.setItemSync(DB_DIFFICULTY_KEY, difficulty);
    }
  }

  return (
    <DifficultyContext.Provider
      value={{
        currentDifficulty,
        setDifficulty,
      }}
    >
      {children}
    </DifficultyContext.Provider>
  );
}

export function useDifficulty() {
  const context = useContext(DifficultyContext);
  if (context === undefined) {
    throw new Error("useDifficulty must be used within a DifficultyProvider");
  }
  return context;
}
