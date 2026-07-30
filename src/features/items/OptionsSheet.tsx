import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { CategoryBadge } from '../../components/CategoryBadge';
import { CATEGORY_LABELS, CATEGORY_ORDER, CategoryIcon } from '../../utils/categories';
import { CategoryKey, categoryColors, colors, fonts } from '../../theme/tokens';

export type OptionsSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type OptionsSheetProps = {
  hiddenCategories: Partial<Record<CategoryKey, boolean>>;
  onToggleCategory: (key: CategoryKey) => void;
  onResetAllToPending: () => void | Promise<void>;
};

export const OptionsSheet = forwardRef<OptionsSheetHandle, OptionsSheetProps>(
  ({ hiddenCategories, onToggleCategory, onResetAllToPending }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [resetting, setResetting] = useState(false);
    const snapPoints = useMemo(() => ['60%'], []);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const onReset = async () => {
      setResetting(true);
      try {
        await onResetAllToPending();
      } finally {
        setResetting(false);
      }
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.bg }}
        handleIndicatorStyle={{ backgroundColor: colors.neutral[300] }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
        )}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Opciones de la lista</Text>

          <Button variant="secondary" block loading={resetting} onPress={onReset}>
            Marcar todos como no comprados
          </Button>

          <View style={{ gap: 2 }}>
            <Text style={styles.fieldLabel}>Mostrar categorías</Text>
            {CATEGORY_ORDER.map((key) => {
              const { bg, fg } = categoryColors[key];
              const visible = !hiddenCategories[key];
              return (
                <View key={key} style={styles.row}>
                  <CategoryBadge bg={bg} size={22}>
                    <CategoryIcon category={key} size={13} color={fg} />
                  </CategoryBadge>
                  <Text style={styles.rowLabel}>{CATEGORY_LABELS[key]}</Text>
                  <Switch
                    value={visible}
                    onValueChange={() => onToggleCategory(key)}
                    trackColor={{ false: colors.neutral[300], true: colors.accent2Ramp[500] }}
                    thumbColor="#fff"
                  />
                </View>
              );
            })}
          </View>

          <Button variant="primary" block onPress={() => sheetRef.current?.dismiss()}>
            Listo
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 30, gap: 18 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  fieldLabel: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(32,30,29,0.7)', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
});
