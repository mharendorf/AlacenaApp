import { StyleSheet, View } from 'react-native';

type CategoryBadgeProps = {
  bg: string;
  size?: number;
  children: React.ReactNode;
};

export function CategoryBadge({ bg, size = 24, children }: CategoryBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, width: size, height: size, borderRadius: size / 3 },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
