import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

export enum Dictionary {
  NWL2020 = 'NWL2020',
  CSW21 = 'CSW21',
}

async function getFileInfoAsync(filename: string) {
  return await FileSystem.getInfoAsync(
    `${FileSystem.documentDirectory}${filename}`
  );
}

export async function loadDictionariesAsync() {}

export async function loadDictionaryAsync(dictionary: Dictionary) {
  const sqliteDirectory = await getFileInfoAsync('SQLite');

  if (!sqliteDirectory.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + 'SQLite'
    );
  }

  const databaseFile = await getFileInfoAsync(`SQLite/${dictionary}.db`);

  if (!databaseFile.exists) {
    if (dictionary === Dictionary.NWL2020) {
      const databaseAsset = Asset.fromModule(
        require('../assets/databases/NWL2020.db')
      );

      if (databaseAsset.localUri) {
        // in production, copy from the build
        FileSystem.copyAsync({
          from: databaseAsset.localUri,
          to: `${FileSystem.documentDirectory}SQLite/${dictionary}.db`,
        });
      } else {
        // in development, download from local server
        FileSystem.downloadAsync(
          databaseAsset.uri,
          `${FileSystem.documentDirectory}SQLite/${dictionary}.db`
        );
      }
    } else if (dictionary === Dictionary.CSW21) {
      const databaseAsset = Asset.fromModule(
        require('../assets/databases/CSW21.db')
      );

      if (databaseAsset.localUri) {
        // in production, copy from the build
        FileSystem.copyAsync({
          from: databaseAsset.localUri,
          to: `${FileSystem.documentDirectory}SQLite/${dictionary}.db`,
        });
      } else {
        // in development, download from local server
        FileSystem.downloadAsync(
          databaseAsset.uri,
          `${FileSystem.documentDirectory}SQLite/${dictionary}.db`
        );
      }
    }
  }
}

export async function lookUpWordAsync(
  dictionary: Dictionary = Dictionary.NWL2020,
  word: string
): Promise<{ word: string; definition: string | null } | null> {
  const db = SQLite.openDatabaseSync(`${dictionary}.db`);

  return new Promise((resolve, reject) => {
    try {
      async function getResultAsync() {
        const result = await db.getFirstAsync(
          `select * from words where word = '${word.toUpperCase()}'`
        ) as { word: string; definition: string | null } | null;
        
        if (result && result.word) {
          return resolve({ word: result.word, definition: result?.definition ?? null });
        } else {
          return resolve(null);
        }
      }
      
      getResultAsync();

    } catch (error) {
      return reject(error);
    }
  });
}
