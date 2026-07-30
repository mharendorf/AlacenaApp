-- Campos nuevos para la Landing rediseñada: descripción editable del hogar
-- y preset de avatar (color + inicial). Sin fotos reales por ahora.
alter table public.households add column if not exists descripcion text;
alter table public.households add column if not exists avatar_preset text;
