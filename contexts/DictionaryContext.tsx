import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import {
  DB_DICTIONARY_KEY,
  Dictionary,
  databaseManager,
} from "../constants/database";

interface DictionaryContextType {
  currentDictionary: Dictionary;
  setDictionary: (dictionary: Dictionary) => void;
  isLoading: boolean;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(
  undefined
);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [currentDictionary, setCurrentDictionary] = useState<Dictionary>(
    Dictionary.NWL2023
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeDictionary() {
      const storedDictionary = Storage.getItemSync(DB_DICTIONARY_KEY);
      const dictionaryToUse = storedDictionary
        ? (storedDictionary as Dictionary)
        : Dictionary.NWL2023;

      setCurrentDictionary(dictionaryToUse);

      // Load only the current dictionary
      try {
        await databaseManager.loadDatabase(dictionaryToUse);
      } catch (error) {
        console.error("Failed to load dictionary:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeDictionary();
  }, []);

  async function setDictionary(dictionary: Dictionary) {
    if (dictionary === currentDictionary) {
      return;
    }

    // Update UI immediately for responsive feel
    setCurrentDictionary(dictionary);
    Storage.setItemSync(DB_DICTIONARY_KEY, dictionary);

    // Load dictionary in background
    setIsLoading(true);
    try {
      await databaseManager.loadDatabase(dictionary);
    } catch (error) {
      console.error("Failed to switch dictionary:", error);
      // Revert on error
      const storedDictionary = Storage.getItemSync(DB_DICTIONARY_KEY);
      if (storedDictionary && storedDictionary !== dictionary) {
        setCurrentDictionary(storedDictionary as Dictionary);
      }
    } finally {
      setIsLoading(false);
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
