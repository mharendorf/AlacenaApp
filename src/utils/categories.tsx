import { CupSoda, Droplet, Leaf, Package, SprayCan, Star } from 'lucide-react-native';
import { CategoryKey, categoryColors } from '../theme/tokens';

export const CATEGORY_ORDER: CategoryKey[] = ['almacen', 'bebidas', 'higiene', 'frescos', 'limpieza', 'varios'];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  almacen: 'Almacén',
  bebidas: 'Bebidas',
  higiene: 'Higiene Personal',
  frescos: 'Frescos',
  limpieza: 'Limpieza',
  varios: 'Varios',
};

const CATEGORY_ICONS: Record<CategoryKey, typeof Package> = {
  almacen: Package,
  bebidas: CupSoda,
  higiene: Droplet,
  frescos: Leaf,
  limpieza: SprayCan,
  varios: Star,
};

export function CategoryIcon({ category, size = 14, color }: { category: CategoryKey; size?: number; color?: string }) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon size={size} color={color ?? categoryColors[category].fg} strokeWidth={2.6} />;
}
