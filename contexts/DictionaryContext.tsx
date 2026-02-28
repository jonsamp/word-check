import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Platform } from "react-native";
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
  undefined,
);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [currentDictionary, setCurrentDictionary] = useState<Dictionary>(
    Dictionary.NWL23,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeDatabase() {
      let storedDictionary: string | null = null;
      if (Platform.OS === "web") {
        storedDictionary = localStorage.getItem(DB_DICTIONARY_KEY);
      } else {
        const Storage = require("expo-sqlite/kv-store").default;
        storedDictionary = Storage.getItemSync(DB_DICTIONARY_KEY);
      }
      const dictionaryToUse = storedDictionary
        ? (storedDictionary as Dictionary)
        : Dictionary.NWL23;

      setCurrentDictionary(dictionaryToUse);

      // Load the unified database once at startup
      try {
        await databaseManager.loadDatabase();
      } catch (error) {
        console.error("Failed to load database:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeDatabase();
  }, []);

  function setDictionary(dictionary: Dictionary) {
    if (dictionary === currentDictionary) {
      return;
    }

    // Switching dictionaries is now instant - no database reload needed
    setCurrentDictionary(dictionary);
    if (Platform.OS === "web") {
      localStorage.setItem(DB_DICTIONARY_KEY, dictionary);
    } else {
      const Storage = require("expo-sqlite/kv-store").default;
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
