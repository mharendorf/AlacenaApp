// Espejo local de households/items + metadatos de sincronizacion.
// sync_status: 'synced' | 'pending' | 'error' — filas 'pending' todavia no
// se empujaron a Supabase (creadas/editadas offline).
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  marca TEXT,
  variedad TEXT,
  cantidad REAL NOT NULL,
  unidad TEXT NOT NULL,
  categoria TEXT NOT NULL,
  estado TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  creado_por TEXT,
  modificado_por TEXT,
  fecha_creacion TEXT NOT NULL,
  fecha_modificacion TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo_invitacion TEXT NOT NULL,
  ultima_fecha_compra TEXT,
  descripcion TEXT,
  avatar_preset TEXT,
  sync_status TEXT NOT NULL DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS sync_meta (
  household_id TEXT PRIMARY KEY,
  last_pulled_at TEXT
);
`;
