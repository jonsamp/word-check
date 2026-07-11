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

    const sourceUri = asset.localUri;
    const sqliteDir = new Directory(Paths.document, "SQLite");

    if (!sqliteDir.exists) {
      await sqliteDir.create();
    }

    const targetFile = new File(sqliteDir, dbName);

    // Copy the bundled database into place. Delete any existing file first so a
    // truncated copy from a previously interrupted launch can't linger.
    const importDatabaseFromAsset = async () => {
      if (targetFile.exists) {
        targetFile.delete();
      }
      await new File(sourceUri).copy(targetFile);
    };

    if (!targetFile.exists) {
      await importDatabaseFromAsset();
    }

    database = await SQLite.openDatabaseAsync(dbName);

    // `openDatabaseAsync` opens lazily and succeeds even on a corrupt/partial
    // file — the failure only surfaces on the first prepared statement as
    // "file is not a database" (SQLite code 26). That happens when an earlier
    // copy was interrupted (app killed mid-copy, low disk, background launch
    // under iOS data protection) and never self-heals, because the truncated
    // file still exists so the copy above is skipped. Verify the database is
    // readable and, if not, re-import once and reopen. Mirrors the web path.
    try {
      await database.getFirstAsync("SELECT 1 FROM words LIMIT 1");
    } catch {
      await database.closeAsync();
      database = null;
      await importDatabaseFromAsset();
      database = await SQLite.openDatabaseAsync(dbName);
    }

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
