import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

export enum Dictionary {
  NWL2023 = "NWL2023",
  CSW24 = "CSW24",
  NSWL2023 = "NSWL2023",
}

export const DB_DICTIONARY_KEY = "dictionary";

export async function loadDictionaryAsync(dictionary: Dictionary) {
  const dbPath = `${FileSystem.documentDirectory}SQLite/${dictionary}.db`;

  // Skip if database already exists
  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  if (dbInfo.exists) {
    return;
  }

  const sqliteDirectory = await FileSystem.getInfoAsync(
    `${FileSystem.documentDirectory}SQLite`
  );

  if (!sqliteDirectory.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "SQLite"
    );
  }

  const dictionaryAssets = {
    [Dictionary.NWL2023]: require("../assets/databases/NWL2023.db"),
    [Dictionary.CSW24]: require("../assets/databases/CSW24.db"),
    [Dictionary.NSWL2023]: require("../assets/databases/NSWL2023.db"),
  };

  const databaseAsset = Asset.fromModule(dictionaryAssets[dictionary]);

  // Ensure asset is downloaded/ready
  await databaseAsset.downloadAsync();

  try {
    if (databaseAsset.localUri) {
      // in production, copy from the build
      await FileSystem.copyAsync({
        from: databaseAsset.localUri,
        to: dbPath,
      });
    } else {
      // in development, download from local server
      await FileSystem.downloadAsync(databaseAsset.uri, dbPath);
    }
  } catch (error) {
    console.error(`Failed to load dictionary ${dictionary}:`, error);
    throw error;
  }
}

export function lookUpWord(
  searchValue: string
): { word: string; definition: string | null; isValid: boolean } | null {
  const defaultDictionary = Dictionary.NWL2023;
  const dictionary =
    Storage.getItemSync(DB_DICTIONARY_KEY) ?? defaultDictionary;

  try {
    const db = SQLite.openDatabaseSync(`${dictionary}.db`);
    const sanitizedSearchValue = searchValue.toUpperCase().trim();
    const statement = db.prepareSync("SELECT * FROM words WHERE word = ?");
    const response = statement.executeSync<{
      word: string;
      definition: string | null;
    }>([sanitizedSearchValue]);
    const row = response.getFirstSync();

    if (row?.word) {
      return {
        isValid: true,
        word: row.word,
        definition: row.definition ?? null,
      };
    } else {
      return {
        isValid: false,
        word: sanitizedSearchValue,
        definition: null,
      };
    }
  } catch (error) {
    console.error(`Database error for ${dictionary}:`, error);
    return null;
  }
}
