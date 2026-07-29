import { Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { colors, fonts } from '../../src/theme/tokens';

// Esta pantalla solo se ve cuando el usuario todavía no pertenece a ningún
// hogar (el guard de app/index.tsx lo manda derecho a Home si ya tiene uno),
// así que a diferencia del prototipo de diseño no hay botón "Ir a mi hogar".
export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.iconCircle}>
        <Home size={40} color={colors.accentRamp[700]} strokeWidth={2.3} />
      </View>
      <View>
        <Text style={styles.h1}>Alacena</Text>
        <Text style={styles.subtitle}>La lista de compras de tu hogar,{'\n'}compartida con todos.</Text>
      </View>
      <View style={{ gap: 12, width: '100%', marginTop: 8 }}>
        <Button variant="primary" block onPress={() => router.push('/(onboarding)/create-household')}>
          Crear un hogar
        </Button>
        <Button variant="secondary" block onPress={() => router.push('/(onboarding)/join-household')}>
          Tengo un código
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.accentRamp[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { fontFamily: fonts.heading, fontSize: 34, color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.text, opacity: 0.75, textAlign: 'center', lineHeight: 15 * 1.55 },
});
