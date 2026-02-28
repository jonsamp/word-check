import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import Storage from "expo-sqlite/kv-store";
import { DB_DICTIONARY_KEY, Dictionary } from "../constants/dictionary";
import { loadDatabase } from "../constants/database";

interface DictionaryContextType {
  currentDictionary: Dictionary;
  setDictionary: (dictionary: Dictionary) => void;
  isLoading: boolean;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [currentDictionary, setCurrentDictionary] = useState<Dictionary>(Dictionary.NWL23);
  const isWeb = Platform.OS === "web";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeDatabase() {
      let storedDictionary: string | null = null;
      if (isWeb) {
        storedDictionary = localStorage.getItem(DB_DICTIONARY_KEY);
      } else {
        storedDictionary = Storage.getItemSync(DB_DICTIONARY_KEY);
      }
      const dictionaryToUse = storedDictionary
        ? (storedDictionary as Dictionary)
        : Dictionary.NWL23;

      setCurrentDictionary(dictionaryToUse);

      try {
        await loadDatabase();
      } catch (error) {
        console.error("Failed to load database:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeDatabase();
  }, [isWeb]);

  function setDictionary(dictionary: Dictionary) {
    if (dictionary === currentDictionary) {
      return;
    }

    setCurrentDictionary(dictionary);
    if (isWeb) {
      localStorage.setItem(DB_DICTIONARY_KEY, dictionary);
    } else {
      Storage.setItemSync(DB_DICTIONARY_KEY, dictionary);
    }
  }

  return (
    <DictionaryContext.Provider
      value={{
        currentDictionary,
        setDictionary,
        isLoading,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
