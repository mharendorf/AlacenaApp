import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

type ButtonProps = PressableProps & {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
};

export const Button = forwardRef<View, ButtonProps>(
  ({ variant = 'primary', block, loading, icon, children, style, disabled, ...rest }, ref) => {
    const isIcon = variant === 'icon';
    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          isIcon && styles.icon,
          block && styles.block,
          pressed && !disabled && stylesPressed[variant],
          (disabled || loading) && styles.disabled,
          typeof style === 'function' ? undefined : style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.accent} />
        ) : (
          <>
            {icon}
            {children != null &&
              (typeof children === 'string' || typeof children === 'number' ? (
                <Text
                  style={[
                    styles.label,
                    variant === 'primary' && styles.labelPrimary,
                    variant === 'ghost' && styles.labelGhost,
                  ]}
                >
                  {children}
                </Text>
              ) : (
                children
              ))}
          </>
        )}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3] * 1.2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { borderColor: colors.divider },
  ghost: { paddingHorizontal: spacing[1], backgroundColor: 'transparent' },
  icon: { width: 36, height: 36, padding: 0 },
  block: { width: '100%' },
  disabled: { opacity: 0.45 },
  label: { fontFamily: fonts.heading, fontSize: 14, color: colors.text },
  labelPrimary: { color: colors.bg },
  labelGhost: { color: colors.accent },
});

const stylesPressed: Record<Variant, object> = {
  primary: { backgroundColor: colors.accentRamp[600] },
  secondary: { backgroundColor: 'rgba(32,30,29,0.07)' },
  ghost: { backgroundColor: 'rgba(198,113,57,0.1)' },
  icon: { backgroundColor: 'rgba(32,30,29,0.07)' },
};
