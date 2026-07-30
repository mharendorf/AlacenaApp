import { getHouseholdRowLocal, upsertHouseholdRow } from '../../lib/db/repository';
import { runSync } from '../../lib/sync/syncEngine';
import { supabase } from '../../lib/supabase';
import { Household } from './types';

// Crear/unirse a un hogar requiere conexion (son los unicos pasos que
// bypassean RLS via RPC) — no tiene sentido offline. Se siembra la fila
// local al toque para que las lecturas local-first de abajo la encuentren
// sin esperar al primer sync.
export async function createHousehold(nombre: string): Promise<Household> {
  const { data, error } = await supabase.rpc('create_household', { p_nombre: nombre });
  if (error) throw error;
  const household = data as Household;
  await upsertHouseholdRow({ ...household, sync_status: 'synced' });
  return household;
}

export async function joinHousehold(codigo: string): Promise<Household> {
  const { data, error } = await supabase.rpc('join_household', { p_codigo: codigo });
  if (error) throw error;
  const household = data as Household;
  await upsertHouseholdRow({ ...household, sync_status: 'synced' });
  return household;
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const row = await getHouseholdRowLocal(householdId);
  if (!row) return null;
  const { sync_status, ...household } = row;
  return household;
}

// No desmarca articulos (regla de negocio): solo registra la fecha en base
// al estado de los flags "comprado" en este momento.
export async function finalizarCompra(householdId: string): Promise<string> {
  const fecha = new Date().toISOString();
  const existing = await getHouseholdRowLocal(householdId);
  if (!existing) throw new Error('Household no encontrado localmente');
  await upsertHouseholdRow({ ...existing, ultima_fecha_compra: fecha, sync_status: 'pending' });
  runSync(householdId).catch(() => {});
  return fecha;
}
