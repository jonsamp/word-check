import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import { DB_DICTIONARY_KEY, Dictionary } from "../constants/database";

interface DictionaryContextType {
  currentDictionary: Dictionary;
  setDictionary: (dictionary: Dictionary) => void;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(
  undefined,
);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [currentDictionary, setCurrentDictionary] = useState<Dictionary>(
    Dictionary.NWL2023,
  );

  useEffect(() => {
    const storedDictionary = Storage.getItemSync(DB_DICTIONARY_KEY);
    const dictionaryToUse = storedDictionary
      ? (storedDictionary as Dictionary)
      : Dictionary.NWL2023;

    setCurrentDictionary(dictionaryToUse);
  }, []);

  function setDictionary(dictionary: Dictionary) {
    Storage.setItemSync(DB_DICTIONARY_KEY, dictionary);

    // Close existing database connection
    const oldDb = SQLite.openDatabaseSync(`${currentDictionary}.db`);
    oldDb.closeSync();

    // Open new database connection
    SQLite.openDatabaseSync(`${dictionary}.db`);

    setCurrentDictionary(dictionary);
  }

  return (
    <DictionaryContext.Provider
      value={{
        currentDictionary,
        setDictionary,
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
