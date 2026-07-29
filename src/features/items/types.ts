import { CategoryKey } from '../../theme/tokens';

export type Unidad = 'unidad' | 'litro' | 'kg' | 'paquete';
export type Estado = 'pendiente' | 'comprado';

export type Item = {
  id: string;
  household_id: string;
  nombre: string;
  marca: string | null;
  variedad: string | null;
  cantidad: number;
  unidad: Unidad;
  categoria: CategoryKey;
  estado: Estado;
  creado_por: string | null;
  modificado_por: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
};

export type ItemFormValues = {
  id: string | null;
  nombre: string;
  marca: string;
  variedad: string;
  cantidad: number;
  unidad: Unidad;
  categoria: CategoryKey;
};

export const UNIDADES: Unidad[] = ['unidad', 'litro', 'kg', 'paquete'];

export function emptyItemForm(categoria: CategoryKey = 'almacen'): ItemFormValues {
  return { id: null, nombre: '', marca: '', variedad: '', cantidad: 1, unidad: 'unidad', categoria };
}
