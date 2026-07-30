// Capa local-first: las pantallas solo hablan con esto. Lee/escribe SQLite
// (src/lib/db/repository.ts) y dispara un intento de sync en background —
// nunca bloquea la UI esperando a la red. El sync "de verdad" (push+pull) lo
// orquestan las pantallas llamando runSync() al abrir/reconectar/refrescar.
import * as Crypto from 'expo-crypto';
import { getItemRowLocal, getItemsLocal, upsertItemRow } from '../../lib/db/repository';
import { runSync } from '../../lib/sync/syncEngine';
import { Item, ItemFormValues } from './types';

function triggerBackgroundSync(householdId: string) {
  runSync(householdId).catch(() => {});
}

export async function listItems(householdId: string): Promise<Item[]> {
  return getItemsLocal(householdId);
}

export async function createItem(householdId: string, userId: string, form: ItemFormValues): Promise<Item> {
  const now = new Date().toISOString();
  const item: Item = {
    id: Crypto.randomUUID(),
    household_id: householdId,
    nombre: form.nombre.trim(),
    marca: form.marca.trim() || null,
    variedad: form.variedad.trim() || null,
    cantidad: form.cantidad,
    unidad: form.unidad,
    categoria: form.categoria,
    estado: 'pendiente',
    creado_por: userId,
    modificado_por: userId,
    fecha_creacion: now,
    fecha_modificacion: now,
  };
  await upsertItemRow({ ...item, is_deleted: 0, sync_status: 'pending' });
  triggerBackgroundSync(householdId);
  return item;
}

export async function updateItem(userId: string, form: ItemFormValues): Promise<Item> {
  if (!form.id) throw new Error('updateItem requires form.id');
  const existing = await getItemRowLocal(form.id);
  if (!existing) throw new Error('Item no encontrado localmente');
  const updated = {
    ...existing,
    nombre: form.nombre.trim(),
    marca: form.marca.trim() || null,
    variedad: form.variedad.trim() || null,
    cantidad: form.cantidad,
    unidad: form.unidad,
    categoria: form.categoria,
    modificado_por: userId,
    fecha_modificacion: new Date().toISOString(),
    sync_status: 'pending' as const,
  };
  await upsertItemRow(updated);
  triggerBackgroundSync(updated.household_id);
  const { is_deleted, sync_status, ...item } = updated;
  return item;
}

export async function toggleEstado(itemId: string, userId: string, estado: 'pendiente' | 'comprado') {
  const existing = await getItemRowLocal(itemId);
  if (!existing) return;
  await upsertItemRow({
    ...existing,
    estado,
    modificado_por: userId,
    fecha_modificacion: new Date().toISOString(),
    sync_status: 'pending',
  });
  triggerBackgroundSync(existing.household_id);
}

// Soft-delete: is_deleted + bump de fecha_modificacion, para que el motor de
// sync propague el borrado igual que cualquier otro cambio.
export async function deleteItem(itemId: string, userId: string) {
  const existing = await getItemRowLocal(itemId);
  if (!existing) return;
  await upsertItemRow({
    ...existing,
    is_deleted: 1,
    modificado_por: userId,
    fecha_modificacion: new Date().toISOString(),
    sync_status: 'pending',
  });
  triggerBackgroundSync(existing.household_id);
}
