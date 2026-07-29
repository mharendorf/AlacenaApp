import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { signOut } from '../../src/features/auth/api';
import { useSession } from '../../src/features/auth/session-context';
import { supabase } from '../../src/lib/supabase';
import { colors, fonts } from '../../src/theme/tokens';

// Placeholder de la Fase 1: confirma que sesión + household quedaron bien
// armados de punta a punta. La Fase 2 lo reemplaza por el Landing real
// (contador de pendientes, última compra, accesos a Agregar/Ver lista).
export default function Home() {
  const insets = useSafeAreaInsets();
  const { profile } = useSession();
  const [householdNombre, setHouseholdNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.household_id) return;
    supabase
      .from('households')
      .select('nombre')
      .eq('id', profile.household_id)
      .single()
      .then(({ data }) => setHouseholdNombre(data?.nombre ?? null));
  }, [profile?.household_id]);

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <Card elevation="md" style={{ gap: 8 }}>
        <Text style={styles.title}>{householdNombre ?? '...'}</Text>
        <Text style={styles.body}>Sesión iniciada como {profile?.nombre || profile?.email}</Text>
        <Text style={styles.note}>
          Pantalla temporal de la Fase 1 — la Lista y el Landing de verdad llegan en la Fase 2.
        </Text>
      </Card>
      <Button variant="secondary" block onPress={onSignOut}>
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, gap: 20 },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.text, opacity: 0.6 },
});
