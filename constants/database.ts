import { Asset } from "expo-asset";
import { File, Directory, Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";

export enum Dictionary {
  NWL23 = "NWL23",
  CSW24 = "CSW24",
  NSWL23 = "NSWL23",
}

export const DictionaryNames: Record<Dictionary, string> = {
  [Dictionary.CSW24]: "Worldwide Dictionary",
  [Dictionary.NSWL23]: "School Dictionary",
  [Dictionary.NWL23]: "US & Canada Dictionary",
};

export const DB_DICTIONARY_KEY = "dictionary";

const unifiedDatabaseAsset = require("../assets/databases/unified.db");

interface DatabaseManager {
  database: SQLite.SQLiteDatabase | null;
  loadDatabase: () => Promise<SQLite.SQLiteDatabase>;
  getDatabase: () => SQLite.SQLiteDatabase | null;
  query: (sql: string, params?: any[]) => Promise<any[]>;
  lookUpWord: (
    searchValue: string,
    dictionary: Dictionary,
  ) => Promise<{
    word: string;
    definition: string | null;
    isValid: boolean;
  } | null>;
  closeDatabase: () => Promise<void>;
}

class DatabaseManagerImpl implements DatabaseManager {
  public database: SQLite.SQLiteDatabase | null = null;

  async loadDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (this.database) {
      return this.database;
    }

    try {
      const asset = Asset.fromModule(unifiedDatabaseAsset);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error("Failed to download unified database asset");
      }

      const dbName = "unified.db";
      const sqliteDir = new Directory(Paths.document, "SQLite");

      if (!sqliteDir.exists) {
        await sqliteDir.create();
      }

      const targetFile = new File(sqliteDir, dbName);

      if (!targetFile.exists) {
        const sourceFile = new File(asset.localUri);
        await sourceFile.copy(targetFile);
      }

      this.database = await SQLite.openDatabaseAsync(dbName);
      return this.database;
    } catch (error) {
      console.error("Error loading unified database:", error);
      throw error;
    }
  }

  getDatabase(): SQLite.SQLiteDatabase | null {
    return this.database;
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.database) {
      throw new Error("Database is not loaded. Call loadDatabase first.");
    }

    try {
      const result = await this.database.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  async lookUpWord(
    searchValue: string,
    dictionary: Dictionary,
  ): Promise<{
    word: string;
    definition: string | null;
    isValid: boolean;
  } | null> {
    if (!this.database) {
      throw new Error("Database is not loaded. Call loadDatabase first.");
    }

    try {
      const sanitizedSearchValue = searchValue.toUpperCase().trim();

      const result = await this.database.getAllAsync(
        "SELECT word, definition, lists FROM words WHERE word = ?",
        [sanitizedSearchValue],
      );

      if (result.length > 0 && result[0]) {
        const row = result[0] as {
          word: string;
          definition: string | null;
          lists: string;
        };
        const isInList = row.lists.split(",").includes(dictionary);

        return {
          isValid: isInList,
          word: row.word,
          definition: isInList ? (row.definition ?? null) : null,
        };
      } else {
        return {
          isValid: false,
          word: sanitizedSearchValue,
          definition: null,
        };
      }
    } catch (error) {
      console.error("Database error:", error);
      return null;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.closeAsync();
      this.database = null;
    }
  }
}

export const databaseManager: DatabaseManager = new DatabaseManagerImpl();
