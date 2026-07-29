import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Copy } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { useSession } from '../../src/features/auth/session-context';
import { colors, fonts, radius } from '../../src/theme/tokens';

export default function InviteCode() {
  const insets = useSafeAreaInsets();
  const { nombre, codigo } = useLocalSearchParams<{ nombre: string; codigo: string }>();
  const { refreshProfile } = useSession();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await Clipboard.setStringAsync(codigo ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onContinue = async () => {
    await refreshProfile();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.iconCircle}>
        <Check size={30} color={colors.accent2Ramp[700]} strokeWidth={2.8} />
      </View>
      <View>
        <Text style={styles.h2}>¡{nombre} está lista!</Text>
        <Text style={styles.subtitle}>Compartí este código para que el resto de tu casa se una a la lista.</Text>
      </View>
      <View style={styles.codeCard}>
        <Text style={styles.code}>{codigo}</Text>
        <Button variant="icon" onPress={onCopy}>
          {copied ? (
            <Check size={16} color={colors.text} strokeWidth={2.4} />
          ) : (
            <Copy size={16} color={colors.text} strokeWidth={2.2} />
          )}
        </Button>
      </View>
      <Button variant="primary" block onPress={onContinue}>
        Continuar a la lista
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: colors.accent2Ramp[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  h2: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.text, opacity: 0.7, textAlign: 'center', lineHeight: 14 * 1.55 },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg * 0.7,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  code: { fontFamily: fonts.heading, fontSize: 26, color: colors.text, letterSpacing: 1.5 },
});
