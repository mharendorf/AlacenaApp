import { format } from 'date-fns';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useSession } from '../../src/features/auth/session-context';
import { getHousehold } from '../../src/features/household/api';
import { Household } from '../../src/features/household/types';
import { listItems } from '../../src/features/items/api';
import { colors, fonts } from '../../src/theme/tokens';

function formatFecha(iso: string | null) {
  if (!iso) return 'nunca';
  return format(new Date(iso), 'dd/MM');
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { profile } = useSession();
  const householdId = profile?.household_id ?? null;

  const [household, setHousehold] = useState<Household | null>(null);
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!householdId) return;
    const [householdData, items] = await Promise.all([getHousehold(householdId), listItems(householdId)]);
    setHousehold(householdData);
    setTotal(items.length);
    setPending(items.filter((it) => it.estado !== 'comprado').length);
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  // Vuelve a cargar los contadores cada vez que se regresa desde la Lista.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View>
        <Text style={styles.h1}>{household?.nombre ?? '...'}</Text>
        <Text style={styles.subtitle}>La lista de compras de tu hogar</Text>
      </View>

      <Card elevation="none" style={styles.summaryCard}>
        <Text style={styles.count}>
          {pending} <Text style={styles.countTotal}>de {total}</Text>
        </Text>
        <Text style={styles.countLabel}>artículos pendientes de comprar</Text>
        <View style={styles.divider} />
        <Text style={styles.lastPurchase}>
          Última compra: <Text style={{ opacity: 1 }}>{formatFecha(household?.ultima_fecha_compra ?? null)}</Text>
        </Text>
      </Card>

      <View style={{ gap: 12, width: '100%' }}>
        <Button variant="primary" block onPress={() => router.push('/(app)/list?openAdd=1')}>
          Agregar producto
        </Button>
        <Button variant="secondary" block onPress={() => router.push('/(app)/list')}>
          Ver la lista
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  h1: { fontFamily: fonts.heading, fontSize: 28, color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.text, opacity: 0.7, textAlign: 'center' },
  summaryCard: { width: '100%', borderRadius: 24, padding: 24, gap: 6 },
  count: { fontFamily: fonts.heading, fontSize: 32, color: colors.text },
  countTotal: { fontFamily: fonts.body, fontSize: 16, opacity: 0.55 },
  countLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.text, opacity: 0.65 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  lastPurchase: { fontFamily: fonts.body, fontSize: 13, color: colors.text, opacity: 0.65 },
});
