import { Pencil, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/tokens';

const ACTION_WIDTH = 70;
const MAX_TRANSLATE = -ACTION_WIDTH * 2;
const OPEN_THRESHOLD = -70;

type SwipeableRowProps = {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export function SwipeableRow({ children, onEdit, onDelete }: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const next = startX.value + event.translationX;
      translateX.value = Math.min(0, Math.max(MAX_TRANSLATE, next));
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value < OPEN_THRESHOLD ? MAX_TRANSLATE : 0, {
        damping: 20,
        stiffness: 220,
      });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const close = () => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 220 });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.accent2Ramp[500] }]}
          onPress={() => {
            close();
            onEdit();
          }}
        >
          <Pencil size={17} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Pressable style={[styles.actionButton, { backgroundColor: colors.destructive }]} onPress={onDelete}>
          <Trash2 size={17} color="#fff" strokeWidth={2.2} />
        </Pressable>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.foreground, rowStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', overflow: 'hidden', borderRadius: 16, marginBottom: 8 },
  actions: { position: 'absolute', top: 0, right: 0, bottom: 0, flexDirection: 'row' },
  actionButton: { width: ACTION_WIDTH, alignItems: 'center', justifyContent: 'center' },
  foreground: { backgroundColor: colors.surface, borderRadius: 16 },
});
