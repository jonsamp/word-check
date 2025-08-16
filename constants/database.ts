import { Asset } from "expo-asset";
import { File, Directory, Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

export enum Dictionary {
  NWL2023 = "NWL2023",
  CSW24 = "CSW24",
  NSWL2023 = "NSWL2023",
}

export const DB_DICTIONARY_KEY = "dictionary";

export async function loadDictionaryAsync(dictionary: Dictionary) {
  const sqliteDirectory = new Directory(Paths.document, "SQLite");
  const dbFile = new File(sqliteDirectory, `${dictionary}.db`);

  // Skip if database already exists
  if (dbFile.exists) {
    return;
  }

  // Create SQLite directory if it doesn't exist
  if (!sqliteDirectory.exists) {
    sqliteDirectory.create();
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
      const sourceFile = new File(Paths.bundle, databaseAsset.localUri);
      sourceFile.copy(dbFile);
    } else {
      // in development, download from local server
      await File.downloadFileAsync(databaseAsset.uri, sqliteDirectory);
      // Rename the downloaded file to match our expected name
      const downloadedFile = new File(
        sqliteDirectory,
        Paths.basename(databaseAsset.uri)
      );
      if (downloadedFile.exists) {
        downloadedFile.move(dbFile);
      }
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
