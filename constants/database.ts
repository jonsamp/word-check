import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import { File, Directory, Paths } from "expo-file-system";

import unifiedDatabaseAsset from "../assets/databases/unified.db";

import { Dictionary } from "./dictionary";

interface WordRow {
  word: string;
  definition: string | null;
  lists: string;
}

let database: SQLite.SQLiteDatabase | null = null;
let loadPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  // Deduplicate concurrent calls (e.g., HMR, React strict mode)
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = loadDatabaseImpl();
  try {
    return await loadPromise;
  } catch (error) {
    loadPromise = null;
    throw error;
  }
}

async function loadDatabaseImpl(): Promise<SQLite.SQLiteDatabase> {
  try {
    const dbName = "unified.db";

    if (Platform.OS === "web") {
      await SQLite.importDatabaseFromAssetAsync(dbName, {
        assetId: unifiedDatabaseAsset,
      });
      database = await SQLite.openDatabaseAsync(dbName);

      // Verify the database has the expected table. If a previous
      // failed import left an empty DB in OPFS, the import above
      // would have been skipped. Delete and force a re-import.
      try {
        await database.getFirstAsync("SELECT 1 FROM words LIMIT 1");
      } catch {
        await database.closeAsync();
        database = null;
        await SQLite.deleteDatabaseAsync(dbName);
        await SQLite.importDatabaseFromAssetAsync(dbName, {
          assetId: unifiedDatabaseAsset,
          forceOverwrite: true,
        });
        database = await SQLite.openDatabaseAsync(dbName);
      }

      return database;
    }

    const asset = Asset.fromModule(unifiedDatabaseAsset);
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error("Failed to download database asset");
    }

    const sqliteDir = new Directory(Paths.document, "SQLite");

    if (!sqliteDir.exists) {
      await sqliteDir.create();
    }

    const targetFile = new File(sqliteDir, dbName);

    if (!targetFile.exists) {
      const sourceFile = new File(asset.localUri);
      await sourceFile.copy(targetFile);
    }

    database = await SQLite.openDatabaseAsync(dbName);
    return database;
  } catch (error) {
    console.error("Error loading database:", error);
    throw error;
  }
}

export async function lookUpWord(
  searchValue: string,
  dictionary: Dictionary
): Promise<{
  word: string;
  definition: string | null;
  isValid: boolean;
}> {
  if (!database) {
    throw new Error("Database is not loaded. Call loadDatabase first.");
  }

  const sanitizedSearchValue = searchValue.toUpperCase().trim();

  const result = await database.getAllAsync<WordRow>(
    "SELECT word, definition, lists FROM words WHERE word = ?",
    [sanitizedSearchValue]
  );

  if (result.length > 0 && result[0]) {
    const row = result[0];
    const isInList = row.lists.split(",").includes(dictionary);

    return {
      isValid: isInList,
      word: row.word,
      definition: isInList ? (row.definition ?? null) : null,
    };
  }

  return {
    isValid: false,
    word: sanitizedSearchValue,
    definition: null,
  };
}
