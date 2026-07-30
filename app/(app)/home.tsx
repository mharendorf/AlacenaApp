import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import { Calendar, Home as HomeIcon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { signOut } from '../../src/features/auth/api';
import { useSession } from '../../src/features/auth/session-context';
import { getHousehold, updateAvatarPreset, updateDescripcion } from '../../src/features/household/api';
import { AvatarPreset, Household } from '../../src/features/household/types';
import { listItems } from '../../src/features/items/api';
import { runSyncWithTimeout } from '../../src/lib/sync/syncEngine';
import { AVATAR_PRESETS, getAvatarPreset } from '../../src/utils/avatarPresets';
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
  const [descripcion, setDescripcionText] = useState('');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const load = useCallback(
    async (withSync: boolean) => {
      if (!householdId) return;
      if (withSync) await runSyncWithTimeout(householdId);
      const [householdData, items] = await Promise.all([getHousehold(householdId), listItems(householdId)]);
      setHousehold(householdData);
      setDescripcionText(householdData?.descripcion ?? '');
      setTotal(items.length);
      setPending(items.filter((it) => it.estado !== 'comprado').length);
    },
    [householdId]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  // Vuelve a cargar los contadores cada vez que se regresa desde la Lista —
  // la Lista ya se encarga de sincronizar, acá solo releemos lo local.
  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const onDescripcionBlur = () => {
    if (!householdId || descripcion === (household?.descripcion ?? '')) return;
    updateDescripcion(householdId, descripcion).catch(() => {});
  };

  const selectPreset = (key: AvatarPreset) => {
    if (!householdId) return;
    setHousehold((h) => (h ? { ...h, avatar_preset: key } : h));
    setAvatarPickerOpen(false);
    updateAvatarPreset(householdId, key).catch(() => {});
  };

  const clearPreset = () => {
    if (!householdId) return;
    setHousehold((h) => (h ? { ...h, avatar_preset: null } : h));
    updateAvatarPreset(householdId, null).catch(() => {});
  };

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const preset = getAvatarPreset(household?.avatar_preset ?? null);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 32 }]}
    >
      <View style={styles.avatarSection}>
        {preset ? (
          <>
            <View style={[styles.avatarCircle, { backgroundColor: preset.bg }]}>
              <Text style={[styles.avatarLetter, { color: preset.fg }]}>{preset.letter}</Text>
            </View>
            <Button variant="ghost" onPress={clearPreset}>
              Subir una foto
            </Button>
          </>
        ) : (
          <>
            <View style={styles.avatarCircle}>
              <HomeIcon size={32} color={colors.accentRamp[700]} strokeWidth={2.2} />
            </View>
            <Button variant="ghost" onPress={() => setAvatarPickerOpen((v) => !v)}>
              Elegir un avatar
            </Button>
          </>
        )}
        {avatarPickerOpen && (
          <View style={styles.presetsRow}>
            {AVATAR_PRESETS.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => selectPreset(p.key)}
                style={[styles.presetSwatch, { backgroundColor: p.bg }]}
              >
                <Text style={[styles.presetLetter, { color: p.fg }]}>{p.letter}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={{ width: '100%' }}>
        <Text style={styles.h1}>{household?.nombre ?? '...'}</Text>
        <TextInput
          style={styles.descripcion}
          value={descripcion}
          onChangeText={setDescripcionText}
          onBlur={onDescripcionBlur}
          placeholder="Descripción del hogar"
          placeholderTextColor={colors.neutral[500]}
        />
      </View>

      <Card elevation="none" style={styles.pendingCard}>
        <Text style={styles.pendingText}>
          <Text style={styles.pendingNumber}>{pending}</Text> de {total} artículos pendientes
        </Text>
      </Card>

      <Card elevation="none" style={styles.purchaseCard}>
        <View style={styles.purchaseIcon}>
          <Calendar size={18} color={colors.accentRamp[700]} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.purchaseLabel}>Última compra</Text>
          <Text style={styles.purchaseValue}>{formatFecha(household?.ultima_fecha_compra ?? null)}</Text>
        </View>
      </Card>

      <View style={{ gap: 12, width: '100%' }}>
        <Button variant="primary" block onPress={() => router.push('/(app)/list?openAdd=1')}>
          Agregar producto
        </Button>
        <Button variant="secondary" block onPress={() => router.push('/(app)/list')}>
          Ver la lista
        </Button>
      </View>

      <Button variant="ghost" onPress={onSignOut}>
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 20,
  },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.accentRamp[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.heading, fontSize: 34 },
  presetsRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  presetSwatch: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  presetLetter: { fontFamily: fonts.heading, fontSize: 12 },
  h1: { fontFamily: fonts.heading, fontSize: 28, color: colors.text, textAlign: 'center', marginBottom: 4 },
  descripcion: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    padding: 0,
  },
  pendingCard: { width: '100%', borderRadius: 20, padding: 20 },
  pendingText: { fontFamily: fonts.body, fontSize: 18, lineHeight: 18 * 1.4, color: colors.text },
  pendingNumber: { fontFamily: fonts.bodyBold, fontSize: 18 },
  purchaseCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  purchaseIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.accentRamp[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseLabel: { fontFamily: fonts.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.text, opacity: 0.6 },
  purchaseValue: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.text },
});
