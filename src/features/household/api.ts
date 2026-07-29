import { supabase } from '../../lib/supabase';
import { Household } from './types';

export async function createHousehold(nombre: string): Promise<Household> {
  const { data, error } = await supabase.rpc('create_household', { p_nombre: nombre });
  if (error) throw error;
  return data as Household;
}

export async function joinHousehold(codigo: string): Promise<Household> {
  const { data, error } = await supabase.rpc('join_household', { p_codigo: codigo });
  if (error) throw error;
  return data as Household;
}

// No desmarca articulos (regla de negocio): solo registra la fecha en base
// al estado de los flags "comprado" en este momento.
export async function finalizarCompra(householdId: string): Promise<string> {
  const fecha = new Date().toISOString();
  const { error } = await supabase.from('households').update({ ultima_fecha_compra: fecha }).eq('id', householdId);
  if (error) throw error;
  return fecha;
}

export async function getHousehold(householdId: string): Promise<Household> {
  const { data, error } = await supabase.from('households').select('*').eq('id', householdId).single();
  if (error) throw error;
  return data as Household;
}
