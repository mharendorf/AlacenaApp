// Llamadas directas a Supabase — usadas solo por el motor de sincronizacion
// (src/lib/sync/syncEngine.ts). Las pantallas nunca llaman esto directo,
// usan la capa local-first en ./api.ts.
import { supabase } from '../../lib/supabase';
import { Item } from './types';

export type RemoteItemRow = Item & { is_deleted: boolean };

export async function fetchItemsSince(householdId: string, sinceIso: string | null): Promise<RemoteItemRow[]> {
  let query = supabase.from('items').select('*').eq('household_id', householdId);
  if (sinceIso) query = query.gt('fecha_modificacion', sinceIso);
  const { data, error } = await query;
  if (error) throw error;
  return data as RemoteItemRow[];
}

export async function pushItem(row: RemoteItemRow): Promise<void> {
  const { error } = await supabase.from('items').upsert({
    id: row.id,
    household_id: row.household_id,
    nombre: row.nombre,
    marca: row.marca,
    variedad: row.variedad,
    cantidad: row.cantidad,
    unidad: row.unidad,
    categoria: row.categoria,
    estado: row.estado,
    is_deleted: row.is_deleted,
    creado_por: row.creado_por,
    modificado_por: row.modificado_por,
    fecha_creacion: row.fecha_creacion,
    fecha_modificacion: row.fecha_modificacion,
  });
  if (error) throw error;
}
