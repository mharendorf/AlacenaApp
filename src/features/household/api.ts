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
