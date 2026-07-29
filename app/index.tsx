import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home } from 'lucide-react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Card } from '../src/components/Card';
import { Tag } from '../src/components/Tag';
import { Chip } from '../src/components/Chip';
import { CategoryBadge } from '../src/components/CategoryBadge';
import { CategoryIcon, CATEGORY_LABELS, CATEGORY_ORDER } from '../src/utils/categories';
import { colors, fonts, categoryColors } from '../src/theme/tokens';

// Pantalla de prueba de la Fase 0 — valida tipografía, colores y componentes
// primitivos en el dispositivo antes de construir las pantallas reales.
export default function KitchenSink() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
    >
      <View style={styles.iconCircle}>
        <Home size={32} color={colors.accentRamp[700]} strokeWidth={2.3} />
      </View>
      <Text style={styles.h1}>Alacena</Text>
      <Text style={styles.body}>Kitchen sink — Fase 0. Estos son los componentes base del design system Organic.</Text>

      <Card elevation="md" style={{ gap: 12 }}>
        <Text style={styles.h4}>Card</Text>
        <Input label="Nombre del hogar" placeholder="Casa Mai" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Tag variant="accent">accent</Tag>
          <Tag variant="accent2">accent2</Tag>
          <Tag variant="neutral">neutral</Tag>
          <Tag variant="outline">outline</Tag>
        </View>
      </Card>

      <View style={{ gap: 12, width: '100%' }}>
        <Button variant="primary" block>
          Ir a mi hogar
        </Button>
        <Button variant="secondary" block>
          Configurar un hogar
        </Button>
        <Button variant="ghost">Cancelar</Button>
      </View>

      <View style={{ gap: 8, width: '100%' }}>
        <Text style={styles.h4}>Categorías</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORY_ORDER.map((key) => (
            <Chip
              key={key}
              label={CATEGORY_LABELS[key]}
              bg={categoryColors[key].bg}
              fg={categoryColors[key].fg}
              icon={<CategoryIcon category={key} size={14} />}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          {CATEGORY_ORDER.map((key) => (
            <CategoryBadge key={key} bg={categoryColors[key].bg}>
              <CategoryIcon category={key} size={14} />
            </CategoryBadge>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 24, alignItems: 'stretch', paddingBottom: 64 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.accentRamp[200],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  h1: { fontFamily: fonts.heading, fontSize: 34, color: colors.text, textAlign: 'center' },
  h4: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 15 * 1.55, color: colors.text, opacity: 0.75, textAlign: 'center' },
});
