import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Migraciones aditivas para bases locales creadas antes de sumar una
// columna nueva — CREATE TABLE IF NOT EXISTS no las agrega solo.
const COLUMN_MIGRATIONS = [
  'ALTER TABLE households ADD COLUMN descripcion TEXT',
  'ALTER TABLE households ADD COLUMN avatar_preset TEXT',
];

async function runColumnMigrations(db: SQLite.SQLiteDatabase) {
  for (const statement of COLUMN_MIGRATIONS) {
    try {
      await db.execAsync(statement);
    } catch {
      // la columna ya existe — normal en instalaciones nuevas donde
      // CREATE TABLE ya la incluyo desde el principio.
    }
  }
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('alacena.db').then(async (db) => {
      await db.execAsync(SCHEMA_SQL);
      await runColumnMigrations(db);
      return db;
    });
  }
  return dbPromise;
}
