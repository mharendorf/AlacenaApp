import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';

type Variant = 'accent' | 'accent2' | 'neutral' | 'outline';

export function Tag({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: Variant }) {
  return (
    <View style={[styles.tag, variantStyles[variant].container]}>
      <Text style={[styles.label, variantStyles[variant].label]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.md * 0.75,
  },
  label: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.2 },
});

const variantStyles: Record<Variant, { container: object; label: object }> = {
  accent: { container: { backgroundColor: colors.accentRamp[100] }, label: { color: colors.accentRamp[800] } },
  accent2: { container: { backgroundColor: colors.accent2Ramp[100] }, label: { color: colors.accent2Ramp[800] } },
  neutral: { container: { backgroundColor: colors.neutral[100] }, label: { color: colors.neutral[800] } },
  outline: { container: { borderWidth: 1, borderColor: colors.accent }, label: { color: colors.accent } },
};
