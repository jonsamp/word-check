import { Asset } from "expo-asset";
import { File, Directory, Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";

export enum Dictionary {
  NWL2023 = "NWL2023",
  CSW24 = "CSW24",
  NSWL2023 = "NSWL2023",
}

export const DictionaryNames: Record<Dictionary, string> = {
  [Dictionary.CSW24]: "Worldwide Dictionary",
  [Dictionary.NSWL2023]: "School Dictionary",
  [Dictionary.NWL2023]: "US & Canada Dictionary",
};

export const DB_DICTIONARY_KEY = "dictionary";

const databaseAssets = {
  [Dictionary.NWL2023]: require("../assets/databases/NWL2023.db"),
  [Dictionary.CSW24]: require("../assets/databases/CSW24.db"),
  [Dictionary.NSWL2023]: require("../assets/databases/NSWL2023.db"),
};

interface DatabaseManager {
  databases: Map<Dictionary, SQLite.SQLiteDatabase>;
  loadDatabase: (dictionary: Dictionary) => Promise<SQLite.SQLiteDatabase>;
  loadAllDatabases: () => Promise<void>;
  getDatabase: (dictionary: Dictionary) => SQLite.SQLiteDatabase | null;
  query: (
    dictionary: Dictionary,
    sql: string,
    params?: any[],
  ) => Promise<any[]>;
  lookUpWord: (
    searchValue: string,
    dictionary: Dictionary,
  ) => Promise<{ word: string; definition: string | null; isValid: boolean } | null>;
  listTables: (dictionary: Dictionary) => Promise<string[]>;
  closeAllDatabases: () => Promise<void>;
}

class DatabaseManagerImpl implements DatabaseManager {
  public databases = new Map<Dictionary, SQLite.SQLiteDatabase>();

  async loadDatabase(dictionary: Dictionary): Promise<SQLite.SQLiteDatabase> {
    if (this.databases.has(dictionary)) {
      return this.databases.get(dictionary)!;
    }

    try {
      const asset = Asset.fromModule(databaseAssets[dictionary]);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error(`Failed to download asset for ${dictionary}`);
      }

      const dbName = `${dictionary}.db`;
      const sqliteDir = new Directory(Paths.document, "SQLite");
      
      if (!sqliteDir.exists) {
        await sqliteDir.create();
      }
      
      const targetFile = new File(sqliteDir, dbName);

      if (!targetFile.exists) {
        const sourceFile = new File(asset.localUri);
        await sourceFile.copy(targetFile);
      }

      const database = await SQLite.openDatabaseAsync(dbName);
      this.databases.set(dictionary, database);

      return database;
    } catch (error) {
      console.error(`Error loading database ${dictionary}:`, error);
      throw error;
    }
  }

  async loadAllDatabases(): Promise<void> {
    const loadPromises = Object.values(Dictionary).map((dictionary) =>
      this.loadDatabase(dictionary),
    );

    await Promise.all(loadPromises);
  }

  getDatabase(dictionary: Dictionary): SQLite.SQLiteDatabase | null {
    return this.databases.get(dictionary) || null;
  }

  async query(
    dictionary: Dictionary,
    sql: string,
    params: any[] = [],
  ): Promise<any[]> {
    const database = this.databases.get(dictionary);
    if (!database) {
      throw new Error(
        `Database ${dictionary} is not loaded. Call loadDatabase first.`,
      );
    }

    try {
      const result = await database.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error(`Error executing query on ${dictionary}:`, error);
      throw error;
    }
  }

  async lookUpWord(
    searchValue: string,
    dictionary: Dictionary,
  ): Promise<{ word: string; definition: string | null; isValid: boolean } | null> {
    const database = this.databases.get(dictionary);
    if (!database) {
      throw new Error(
        `Database ${dictionary} is not loaded. Call loadDatabase first.`,
      );
    }

    try {
      const sanitizedSearchValue = searchValue.toUpperCase().trim();
      const result = await database.getAllAsync(
        "SELECT * FROM words WHERE word = ?",
        [sanitizedSearchValue],
      );
      
      if (result.length > 0 && result[0]) {
        const row = result[0] as { word: string; definition: string | null };
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

  async listTables(dictionary: Dictionary): Promise<string[]> {
    const database = this.databases.get(dictionary);
    if (!database) {
      throw new Error(
        `Database ${dictionary} is not loaded. Call loadDatabase first.`,
      );
    }

    try {
      const result = await database.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table'",
      );
      return result.map((row: any) => row.name);
    } catch (error) {
      console.error(`Error listing tables for ${dictionary}:`, error);
      throw error;
    }
  }

  async closeAllDatabases(): Promise<void> {
    const closePromises = Array.from(this.databases.values()).map((db) =>
      db.closeAsync(),
    );

    await Promise.all(closePromises);
    this.databases.clear();
  }
}

export const databaseManager: DatabaseManager = new DatabaseManagerImpl();
