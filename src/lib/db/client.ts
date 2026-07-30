import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('alacena.db').then(async (db) => {
      await db.execAsync(SCHEMA_SQL);
      return db;
    });
  }
  return dbPromise;
}
