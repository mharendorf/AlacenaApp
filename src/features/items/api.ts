import { supabase } from '../../lib/supabase';
import { Item, ItemFormValues } from './types';

export async function listItems(householdId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_deleted', false)
    .order('fecha_creacion', { ascending: true });
  if (error) throw error;
  return data as Item[];
}

export async function createItem(householdId: string, userId: string, form: ItemFormValues): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert({
      household_id: householdId,
      nombre: form.nombre.trim(),
      marca: form.marca.trim() || null,
      variedad: form.variedad.trim() || null,
      cantidad: form.cantidad,
      unidad: form.unidad,
      categoria: form.categoria,
      creado_por: userId,
      modificado_por: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Item;
}

export async function updateItem(userId: string, form: ItemFormValues): Promise<Item> {
  if (!form.id) throw new Error('updateItem requires form.id');
  const { data, error } = await supabase
    .from('items')
    .update({
      nombre: form.nombre.trim(),
      marca: form.marca.trim() || null,
      variedad: form.variedad.trim() || null,
      cantidad: form.cantidad,
      unidad: form.unidad,
      categoria: form.categoria,
      modificado_por: userId,
      fecha_modificacion: new Date().toISOString(),
    })
    .eq('id', form.id)
    .select()
    .single();
  if (error) throw error;
  return data as Item;
}

export async function toggleEstado(itemId: string, userId: string, estado: 'pendiente' | 'comprado') {
  const { error } = await supabase
    .from('items')
    .update({ estado, modificado_por: userId, fecha_modificacion: new Date().toISOString() })
    .eq('id', itemId);
  if (error) throw error;
}

// Soft-delete: coincide con la estrategia offline de la Fase 3 (is_deleted +
// bump de fecha_modificacion), asi no hay que migrar el comportamiento despues.
export async function deleteItem(itemId: string, userId: string) {
  const { error } = await supabase
    .from('items')
    .update({ is_deleted: true, modificado_por: userId, fecha_modificacion: new Date().toISOString() })
    .eq('id', itemId);
  if (error) throw error;
}
