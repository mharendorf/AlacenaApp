import { fetchRemoteHousehold, pushHousehold } from '../../features/household/remote';
import { fetchItemsSince, pushItem } from '../../features/items/remote';
import {
  getHouseholdRowLocal,
  getItemRowLocal,
  getLastPulledAt,
  getPendingItemRows,
  markHouseholdSynced,
  markItemSynced,
  setLastPulledAt,
  upsertHouseholdRow,
  upsertItemRow,
} from '../db/repository';

let syncing = false;

// Push primero (mandamos lo que cambio local), despues pull (traemos lo que
// cambio en otros dispositivos). Todo se hace best-effort: si algo falla por
// falta de conexion, la fila se queda 'pending' y se reintenta en el proximo
// disparo de sync (apertura de app, pull-to-refresh, reconexion).
// Version con timeout para usar antes de leer datos en pantalla — si no hay
// conexion, no queremos que la carga de la pantalla se cuelgue esperando a
// que el fetch falle por su cuenta.
export async function runSyncWithTimeout(householdId: string, timeoutMs = 6000): Promise<void> {
  await Promise.race([runSync(householdId), new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}

export async function runSync(householdId: string): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    await pushPending(householdId);
    await pullRemote(householdId);
  } catch {
    // sin conexion u otro error transitorio — se reintenta en el proximo disparo
  } finally {
    syncing = false;
  }
}

async function pushPending(householdId: string) {
  const pendingItems = await getPendingItemRows(householdId);
  for (const row of pendingItems) {
    try {
      await pushItem({ ...row, is_deleted: !!row.is_deleted });
      await markItemSynced(row.id);
    } catch {
      // se reintenta en el proximo sync
    }
  }

  const householdRow = await getHouseholdRowLocal(householdId);
  if (householdRow?.sync_status === 'pending') {
    try {
      await pushHousehold(householdRow);
      await markHouseholdSynced(householdId);
    } catch {
      // se reintenta en el proximo sync
    }
  }
}

async function pullRemote(householdId: string) {
  const lastPulledAt = await getLastPulledAt(householdId);
  const now = new Date().toISOString();

  const remoteHousehold = await fetchRemoteHousehold(householdId);
  const localHousehold = await getHouseholdRowLocal(householdId);
  // Si el push de arriba fallo (seguimos sin conexion), el local sigue
  // 'pending' — no lo pisamos con la version remota vieja.
  if (!localHousehold || localHousehold.sync_status !== 'pending') {
    await upsertHouseholdRow({ ...remoteHousehold, sync_status: 'synced' });
  }

  const remoteItems = await fetchItemsSince(householdId, lastPulledAt);
  for (const remote of remoteItems) {
    const { is_deleted, ...item } = remote;
    const localRow = await getItemRowLocal(item.id);
    if (!localRow || localRow.sync_status !== 'pending') {
      await upsertItemRow({ ...item, is_deleted: is_deleted ? 1 : 0, sync_status: 'synced' });
      continue;
    }
    // Conflicto: local pending vs. remoto — gana la fecha_modificacion mas
    // reciente, fila completa, sin merge de campos.
    if (new Date(remote.fecha_modificacion) > new Date(localRow.fecha_modificacion)) {
      await upsertItemRow({ ...item, is_deleted: is_deleted ? 1 : 0, sync_status: 'synced' });
    }
    // si gana el local, se deja como esta: se va a re-empujar en el proximo push
  }

  await setLastPulledAt(householdId, now);
}
