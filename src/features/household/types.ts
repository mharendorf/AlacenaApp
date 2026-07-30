export type Profile = {
  id: string;
  nombre: string;
  email: string;
  household_id: string | null;
};

export type AvatarPreset = 'a' | 'b' | 'c' | 'd' | 'e';

export type Household = {
  id: string;
  nombre: string;
  codigo_invitacion: string;
  ultima_fecha_compra: string | null;
  descripcion: string | null;
  avatar_preset: AvatarPreset | null;
};
