// Llamadas directas a Supabase — usadas solo por el motor de sincronizacion.
import { supabase } from '../../lib/supabase';
import { Household } from './types';

export async function fetchRemoteHousehold(householdId: string): Promise<Household> {
  const { data, error } = await supabase.from('households').select('*').eq('id', householdId).single();
  if (error) throw error;
  return data as Household;
}

export async function pushHousehold(household: Household): Promise<void> {
  const { error } = await supabase
    .from('households')
    .update({
      nombre: household.nombre,
      ultima_fecha_compra: household.ultima_fecha_compra,
      descripcion: household.descripcion,
      avatar_preset: household.avatar_preset,
    })
    .eq('id', household.id);
  if (error) throw error;
}
