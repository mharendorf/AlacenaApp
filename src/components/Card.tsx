import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/tokens';

type Elevation = 'none' | 'sm' | 'md' | 'lg';

type CardProps = ViewProps & { elevation?: Elevation };

export function Card({ elevation = 'none', style, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.card, elevation !== 'none' && shadows[elevation], style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.lg * 1.15,
    backgroundColor: colors.surface,
  },
});
