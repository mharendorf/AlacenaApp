import { Pressable, StyleSheet, Text } from 'react-native';
import { fonts, radius } from '../theme/tokens';

type ChipProps = {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  bg: string;
  fg: string;
  onPress?: () => void;
};

export function Chip({ label, icon, selected, bg, fg, onPress }: ChipProps) {
  const background = selected ? fg : bg;
  const color = selected ? bg : fg;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: background, borderColor: selected ? fg : 'transparent' },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  label: { fontFamily: fonts.body, fontSize: 12.5 },
});
