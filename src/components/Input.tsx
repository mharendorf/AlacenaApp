import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/tokens';

type FieldProps = TextInputProps & {
  label?: string;
};

export const Input = forwardRef<TextInput, FieldProps>(({ label, style, ...rest }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      {label != null && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.neutral[500]}
        selectionColor={colors.accent}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, style]}
        {...rest}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: 5 },
  label: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(32,30,29,0.7)' },
  input: {
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.pill,
  },
  inputFocused: { borderColor: colors.accent },
});
