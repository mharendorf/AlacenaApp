import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useSession } from '../../src/features/auth/session-context';
import { joinHousehold } from '../../src/features/household/api';
import { colors, fonts } from '../../src/theme/tokens';

export default function JoinHousehold() {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useSession();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onJoin = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await joinHousehold(codigo.trim());
      await refreshProfile();
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido, revisalo e intentá de nuevo.');
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
            <Text style={styles.h2}>Unite a un hogar</Text>
            <Text style={styles.subtitle}>Pedile el código de invitación a alguien de tu casa.</Text>
          </View>
          <Input
            label="Código de invitación"
            placeholder="CASA-7XQ2"
            value={codigo}
            onChangeText={(text) => setCodigo(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button variant="primary" block disabled={!codigo.trim()} loading={loading} onPress={onJoin}>
            Unirme
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
