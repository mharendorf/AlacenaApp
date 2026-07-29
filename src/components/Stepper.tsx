import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export function Stepper({ value, onChange, min = 1 }: StepperProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.symbol}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable style={styles.button} onPress={() => onChange(value + 1)}>
        <Text style={styles.symbol}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontFamily: fonts.body, fontSize: 18, color: colors.text, lineHeight: 20 },
  value: { flex: 1, textAlign: 'center', fontFamily: fonts.body, fontSize: 15, color: colors.text },
});
