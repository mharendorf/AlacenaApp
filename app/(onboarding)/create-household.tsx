import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { createHousehold } from '../../src/features/household/api';
import { colors, fonts } from '../../src/theme/tokens';

export default function CreateHousehold() {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onContinue = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const household = await createHousehold(nombre.trim());
      router.push({
        pathname: '/(onboarding)/invite-code',
        params: { nombre: household.nombre, codigo: household.codigo_invitacion },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el hogar, probá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <Button variant="icon" onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.text} strokeWidth={2.3} />
        </Button>
        <View style={{ flex: 1, justifyContent: 'center', gap: 22 }}>
          <View>
            <Text style={styles.h2}>Creá tu hogar</Text>
            <Text style={styles.subtitle}>Le vas a poder poner nombre y después invitar al resto.</Text>
          </View>
          <Input label="Nombre del hogar" placeholder="Casa Mai" value={nombre} onChangeText={setNombre} />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button variant="primary" block disabled={!nombre.trim()} loading={loading} onPress={onContinue}>
            Continuar
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  h2: { fontFamily: fonts.heading, fontSize: 26, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.text, opacity: 0.7 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.destructive },
});
