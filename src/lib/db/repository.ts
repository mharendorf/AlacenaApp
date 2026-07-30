import { Household } from '../../features/household/types';
import { Item } from '../../features/items/types';
import { getDb } from './client';

export type SyncStatus = 'synced' | 'pending' | 'error';
export type ItemRow = Item & { is_deleted: number; sync_status: SyncStatus };
export type HouseholdRow = Household & { sync_status: SyncStatus };

function rowToItem(row: ItemRow): Item {
  const { is_deleted, sync_status, ...item } = row;
  return item;
}

// ── items ────────────────────────────────────────────────────────────────

export async function getItemsLocal(householdId: string): Promise<Item[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE household_id = ? AND is_deleted = 0 ORDER BY fecha_creacion ASC',
    [householdId]
  );
  return rows.map(rowToItem);
}

export async function getItemRowLocal(id: string): Promise<ItemRow | null> {
  const db = await getDb();
  return (await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', [id])) ?? null;
}

export async function getPendingItemRows(householdId: string): Promise<ItemRow[]> {
  const db = await getDb();
  return db.getAllAsync<ItemRow>('SELECT * FROM items WHERE household_id = ? AND sync_status = ?', [
    householdId,
    'pending',
  ]);
}

export async function upsertItemRow(row: ItemRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO items (id, household_id, nombre, marca, variedad, cantidad, unidad, categoria, estado,
       is_deleted, creado_por, modificado_por, fecha_creacion, fecha_modificacion, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       household_id=excluded.household_id, nombre=excluded.nombre, marca=excluded.marca,
       variedad=excluded.variedad, cantidad=excluded.cantidad, unidad=excluded.unidad,
       categoria=excluded.categoria, estado=excluded.estado, is_deleted=excluded.is_deleted,
       creado_por=excluded.creado_por, modificado_por=excluded.modificado_por,
       fecha_creacion=excluded.fecha_creacion, fecha_modificacion=excluded.fecha_modificacion,
       sync_status=excluded.sync_status`,
    [
      row.id,
      row.household_id,
      row.nombre,
      row.marca,
      row.variedad,
      row.cantidad,
      row.unidad,
      row.categoria,
      row.estado,
      row.is_deleted,
      row.creado_por,
      row.modificado_por,
      row.fecha_creacion,
      row.fecha_modificacion,
      row.sync_status,
    ]
  );
}

export async function markItemSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE items SET sync_status = ? WHERE id = ?', ['synced', id]);
}

// ── households ───────────────────────────────────────────────────────────

export async function getHouseholdRowLocal(id: string): Promise<HouseholdRow | null> {
  const db = await getDb();
  return (await db.getFirstAsync<HouseholdRow>('SELECT * FROM households WHERE id = ?', [id])) ?? null;
}

export async function upsertHouseholdRow(row: HouseholdRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO households (id, nombre, codigo_invitacion, ultima_fecha_compra, sync_status)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nombre=excluded.nombre, codigo_invitacion=excluded.codigo_invitacion,
       ultima_fecha_compra=excluded.ultima_fecha_compra, sync_status=excluded.sync_status`,
    [row.id, row.nombre, row.codigo_invitacion, row.ultima_fecha_compra, row.sync_status]
  );
}

export async function markHouseholdSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE households SET sync_status = ? WHERE id = ?', ['synced', id]);
}

// ── sync metadata ────────────────────────────────────────────────────────

export async function getLastPulledAt(householdId: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ last_pulled_at: string | null }>(
    'SELECT last_pulled_at FROM sync_meta WHERE household_id = ?',
    [householdId]
  );
  return row?.last_pulled_at ?? null;
}

export async function setLastPulledAt(householdId: string, iso: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sync_meta (household_id, last_pulled_at) VALUES (?, ?)
     ON CONFLICT(household_id) DO UPDATE SET last_pulled_at = excluded.last_pulled_at`,
    [householdId, iso]
  );
}
