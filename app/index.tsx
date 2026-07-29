import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../src/features/auth/session-context';
import { colors } from '../src/theme/tokens';

// Puerta de entrada: decide a qué grupo de rutas mandar al usuario según su
// sesión y si ya pertenece a un hogar. Todas las pantallas de (onboarding)
// asumen que llegaron acá porque household_id todavía es null.
export default function Index() {
  const { session, profile, loading } = useSession();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profile?.household_id) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(app)/home" />;
}
