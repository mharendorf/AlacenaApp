// AsyncStorage: solo preferencias de UI locales al dispositivo (no
// sincronizan entre usuarios del hogar) — sesión la maneja supabase-js.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryKey } from '../theme/tokens';

function hiddenCategoriesKey(householdId: string) {
  return `alacena.hiddenCategories.${householdId}`;
}

export async function getHiddenCategories(householdId: string): Promise<Partial<Record<CategoryKey, boolean>>> {
  const raw = await AsyncStorage.getItem(hiddenCategoriesKey(householdId));
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function setHiddenCategories(
  householdId: string,
  hidden: Partial<Record<CategoryKey, boolean>>
): Promise<void> {
  await AsyncStorage.setItem(hiddenCategoriesKey(householdId), JSON.stringify(hidden));
}
