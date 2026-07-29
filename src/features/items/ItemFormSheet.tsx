import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Stepper } from '../../components/Stepper';
import { CategoryIcon, CATEGORY_LABELS, CATEGORY_ORDER } from '../../utils/categories';
import { categoryColors, colors, fonts } from '../../theme/tokens';
import { createItem, deleteItem, updateItem } from './api';
import { emptyItemForm, Item, ItemFormValues, UNIDADES } from './types';

export type ItemFormSheetHandle = {
  presentForCreate: () => void;
  presentForEdit: (item: Item) => void;
};

type ItemFormSheetProps = {
  householdId: string;
  userId: string;
  onSaved: () => void;
  onDeleted: () => void;
};

function toForm(item: Item): ItemFormValues {
  return {
    id: item.id,
    nombre: item.nombre,
    marca: item.marca ?? '',
    variedad: item.variedad ?? '',
    cantidad: item.cantidad,
    unidad: item.unidad,
    categoria: item.categoria,
  };
}

export const ItemFormSheet = forwardRef<ItemFormSheetHandle, ItemFormSheetProps>(
  ({ householdId, userId, onSaved, onDeleted }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [form, setForm] = useState<ItemFormValues>(emptyItemForm());
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const snapPoints = useMemo(() => ['85%'], []);

    useImperativeHandle(ref, () => ({
      presentForCreate: () => {
        setForm(emptyItemForm());
        setIsEditing(false);
        sheetRef.current?.present();
      },
      presentForEdit: (item: Item) => {
        setForm(toForm(item));
        setIsEditing(true);
        sheetRef.current?.present();
      },
    }));

    const close = () => sheetRef.current?.dismiss();

    const onSave = async () => {
      if (!form.nombre.trim()) return;
      setSaving(true);
      try {
        if (isEditing && form.id) {
          await updateItem(userId, form);
        } else {
          await createItem(householdId, userId, form);
        }
        onSaved();
        close();
      } finally {
        setSaving(false);
      }
    };

    const onDelete = async () => {
      if (!form.id) return;
      setSaving(true);
      try {
        await deleteItem(form.id, userId);
        onDeleted();
        close();
      } finally {
        setSaving(false);
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
        <BottomSheetScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isEditing ? 'Editar artículo' : 'Nuevo artículo'}</Text>

          <Input
            label="Nombre"
            placeholder="Ej. Manzanas"
            value={form.nombre}
            onChangeText={(nombre) => setForm((f) => ({ ...f, nombre }))}
          />

          <View style={{ gap: 8 }}>
            <Text style={styles.fieldLabel}>Categoría</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORY_ORDER.map((key) => {
                const selected = form.categoria === key;
                const { bg, fg } = categoryColors[key];
                return (
                  <Chip
                    key={key}
                    label={CATEGORY_LABELS[key]}
                    bg={bg}
                    fg={fg}
                    selected={selected}
                    icon={<CategoryIcon category={key} size={14} color={selected ? bg : fg} />}
                    onPress={() => setForm((f) => ({ ...f, categoria: key }))}
                  />
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Marca (opcional)"
                placeholder="Ej. Sedal"
                value={form.marca}
                onChangeText={(marca) => setForm((f) => ({ ...f, marca }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Variedad (opcional)"
                placeholder="Ej. light"
                value={form.variedad}
                onChangeText={(variedad) => setForm((f) => ({ ...f, variedad }))}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.fieldLabel}>Cantidad</Text>
              <Stepper value={form.cantidad} onChange={(cantidad) => setForm((f) => ({ ...f, cantidad }))} />
            </View>
            <View style={{ flex: 1.4, gap: 5 }}>
              <Text style={styles.fieldLabel}>Unidad</Text>
              <SegmentedControl
                options={UNIDADES}
                value={form.unidad}
                onChange={(unidad) => setForm((f) => ({ ...f, unidad }))}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            {isEditing && (
              <View style={{ flex: 1 }}>
                <Button variant="secondary" block onPress={onDelete} disabled={saving}>
                  Eliminar
                </Button>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Button variant="secondary" block onPress={close} disabled={saving}>
                Cancelar
              </Button>
            </View>
            <View style={{ flex: 1.4 }}>
              <Button variant="primary" block onPress={onSave} loading={saving} disabled={!form.nombre.trim()}>
                Guardar
              </Button>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 40, gap: 16 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  fieldLabel: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(32,30,29,0.7)' },
});
