import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.seg}>
      {options.map((option, index) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.opt, index > 0 && styles.optBorder, selected && styles.optSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  seg: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  opt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
  optBorder: { borderLeftWidth: 1, borderLeftColor: colors.divider },
  optSelected: { backgroundColor: colors.accent },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  labelSelected: { color: colors.bg },
});
