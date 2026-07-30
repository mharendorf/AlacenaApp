import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { colors, fonts } from '../theme/tokens';

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut.duration(200)} style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center' },
  toast: {
    maxWidth: '80%',
    backgroundColor: colors.neutral[900],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  text: { fontFamily: fonts.body, fontSize: 13, color: colors.bg, textAlign: 'center' },
});
