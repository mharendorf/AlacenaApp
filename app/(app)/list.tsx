import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, ChevronLeft, ChevronRight, Package, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { Input } from '../../src/components/Input';
import { SwipeableRow } from '../../src/components/SwipeableRow';
import { Tag } from '../../src/components/Tag';
import { Toast } from '../../src/components/Toast';
import { useSession } from '../../src/features/auth/session-context';
import { finalizarCompra, getHousehold } from '../../src/features/household/api';
import { Household } from '../../src/features/household/types';
import { ItemFormSheet, ItemFormSheetHandle } from '../../src/features/items/ItemFormSheet';
import { deleteItem, listItems, resetAllToPending, toggleEstado } from '../../src/features/items/api';
import { Item } from '../../src/features/items/types';
import { OptionsSheet, OptionsSheetHandle } from '../../src/features/items/OptionsSheet';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { getHiddenCategories, setHiddenCategories } from '../../src/lib/storage';
import { runSyncWithTimeout } from '../../src/lib/sync/syncEngine';
import { CATEGORY_LABELS, CATEGORY_ORDER, CategoryIcon } from '../../src/utils/categories';
import { CategoryKey, categoryColors, colors, fonts } from '../../src/theme/tokens';

function formatFecha(iso: string | null) {
  if (!iso) return 'nunca';
  return format(new Date(iso), 'dd/MM');
}

export default function Lista() {
  const insets = useSafeAreaInsets();
  const { session, profile } = useSession();
  const { openAdd } = useLocalSearchParams<{ openAdd?: string }>();
  const householdId = profile?.household_id ?? null;
  const userId = session?.user.id ?? null;

  const [household, setHousehold] = useState<Household | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Partial<Record<CategoryKey, boolean>>>({});
  const [hiddenCategories, setHiddenCategoriesState] = useState<Partial<Record<CategoryKey, boolean>>>({});
  const [finalizando, setFinalizando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sheetRef = useRef<ItemFormSheetHandle>(null);
  const optionsRef = useRef<OptionsSheetHandle>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(
    async (withSync: boolean) => {
      if (!householdId) return;
      setError(false);
      try {
        if (withSync) await runSyncWithTimeout(householdId);
        const [householdData, itemsData] = await Promise.all([getHousehold(householdId), listItems(householdId)]);
        setHousehold(householdData);
        setItems(itemsData);
      } catch {
        setError(true);
      }
    },
    [householdId]
  );

  const isOnline = useNetworkStatus(() => {
    if (householdId) loadAll(true);
  });

  useEffect(() => {
    setLoading(true);
    loadAll(true).finally(() => setLoading(false));
  }, [loadAll]);

  useEffect(() => {
    if (openAdd) sheetRef.current?.presentForCreate();
  }, [openAdd]);

  useEffect(() => {
    if (!householdId) return;
    getHiddenCategories(householdId).then(setHiddenCategoriesState);
  }, [householdId]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll(true);
    setRefreshing(false);
  };

  const onToggle = async (item: Item) => {
    const nextEstado = item.estado === 'comprado' ? 'pendiente' : 'comprado';
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, estado: nextEstado } : it)));
    if (!userId) return;
    try {
      await toggleEstado(item.id, userId, nextEstado);
    } catch {
      await loadAll(false);
    }
  };

  const onDeleteItem = async (item: Item) => {
    if (!userId) return;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    try {
      await deleteItem(item.id, userId);
    } catch {
      await loadAll(false);
    }
  };

  const onToggleCategoryVisibility = (key: CategoryKey) => {
    setHiddenCategoriesState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (householdId) setHiddenCategories(householdId, next);
      return next;
    });
  };

  const onResetAllToPending = async () => {
    if (!householdId || !userId) return;
    await resetAllToPending(householdId, userId);
    await loadAll(false);
  };

  const onFinalizarCompra = async () => {
    if (!householdId) return;
    setFinalizando(true);
    try {
      const fecha = await finalizarCompra(householdId);
      setHousehold((h) => (h ? { ...h, ultima_fecha_compra: fecha } : h));
      showToast('Compra finalizada · fecha actualizada');
    } finally {
      setFinalizando(false);
    }
  };

  const searchLower = search.trim().toLowerCase();
  const filtered = items.filter(
    (it) =>
      !searchLower ||
      it.nombre.toLowerCase().includes(searchLower) ||
      (it.marca ?? '').toLowerCase().includes(searchLower)
  );

  const total = items.length;
  const pending = items.filter((it) => it.estado !== 'comprado').length;

  if (!householdId || !userId) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 6 }}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Sin conexión — tus cambios se guardan y se sincronizan solos al reconectar
          </Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Button variant="icon" onPress={() => router.replace('/(app)/home')}>
            <ChevronLeft size={17} color={colors.text} strokeWidth={2.3} />
          </Button>
          <Text style={[styles.title, { flex: 1 }]} numberOfLines={1}>
            {household?.nombre ?? '...'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Button variant="icon" onPress={() => optionsRef.current?.present()}>
            <SlidersHorizontal size={17} color={colors.text} strokeWidth={2.3} />
          </Button>
          <Text style={[styles.subtitle, { flex: 1, marginTop: 0 }]} numberOfLines={1}>
            Última compra: {formatFecha(household?.ultima_fecha_compra ?? null)}
          </Text>
          <Button variant="secondary" onPress={onFinalizarCompra} loading={finalizando}>
            Finalizar compra
          </Button>
        </View>

        <View style={{ position: 'relative' }}>
          <View style={styles.searchIcon}>
            <Search size={16} color={colors.neutral[600]} strokeWidth={2.2} />
          </View>
          <Input placeholder="Buscar artículo" value={search} onChangeText={setSearch} style={{ paddingLeft: 38 }} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <AlertTriangle size={28} color={colors.destructive} strokeWidth={2.2} />
          <Text style={styles.emptyText}>No se pudo cargar la lista. Deslizá hacia abajo para reintentar.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {total === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Package size={28} color={colors.neutral[600]} strokeWidth={2.2} />
              </View>
              <Text style={styles.emptyText}>Tu lista está vacía. Agregá el primer artículo para empezar.</Text>
              <Button variant="primary" onPress={() => sheetRef.current?.presentForCreate()}>
                Agregar producto
              </Button>
            </View>
          )}

          {CATEGORY_ORDER.map((key) => {
            if (hiddenCategories[key]) return null;
            const categoryItems = filtered.filter((it) => it.categoria === key);
            if (categoryItems.length === 0) return null;
            const isExpanded = !collapsed[key];
            const { bg, fg } = categoryColors[key];
            return (
              <View key={key} style={{ marginTop: 18 }}>
                <Pressable
                  style={styles.groupHeader}
                  onPress={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))}
                >
                  <CategoryBadge bg={bg}>
                    <CategoryIcon category={key} size={14} color={fg} />
                  </CategoryBadge>
                  <Text style={styles.groupLabel}>{CATEGORY_LABELS[key]}</Text>
                  <Text style={styles.groupCount}>{categoryItems.length}</Text>
                  <View style={{ marginLeft: 'auto', transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                    <ChevronRight size={14} color={colors.neutral[500]} strokeWidth={2.4} />
                  </View>
                </Pressable>

                {isExpanded &&
                  categoryItems.map((item) => {
                    const done = item.estado === 'comprado';
                    const subline = [item.marca, item.variedad].filter(Boolean).join(' · ');
                    return (
                      <SwipeableRow
                        key={item.id}
                        onEdit={() => sheetRef.current?.presentForEdit(item)}
                        onDelete={() => onDeleteItem(item)}
                      >
                        <View style={styles.row}>
                          <Pressable
                            onPress={() => onToggle(item)}
                            style={[
                              styles.checkbox,
                              {
                                borderColor: done ? colors.accent2Ramp[600] : colors.neutral[400],
                                backgroundColor: done ? colors.accent2Ramp[600] : 'transparent',
                              },
                            ]}
                          />
                          <Pressable
                            style={{ flex: 1, minWidth: 0 }}
                            onPress={() => sheetRef.current?.presentForEdit(item)}
                          >
                            <Text
                              style={[styles.itemName, done && { textDecorationLine: 'line-through', opacity: 0.45 }]}
                              numberOfLines={1}
                            >
                              {item.nombre}
                            </Text>
                            {subline.length > 0 && (
                              <Text style={styles.itemSubline} numberOfLines={1}>
                                {subline}
                              </Text>
                            )}
                          </Pressable>
                          <Tag variant="neutral">
                            {item.cantidad} {item.unidad}
                          </Tag>
                        </View>
                      </SwipeableRow>
                    );
                  })}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Button variant="primary" style={styles.fab} onPress={() => sheetRef.current?.presentForCreate()}>
        <Plus size={22} color={colors.bg} strokeWidth={2.4} />
      </Button>

      <Toast message={toast} />

      <ItemFormSheet
        ref={sheetRef}
        householdId={householdId}
        userId={userId}
        onSaved={() => loadAll(false)}
        onDeleted={() => loadAll(false)}
      />

      <OptionsSheet
        ref={optionsRef}
        hiddenCategories={hiddenCategories}
        onToggleCategory={onToggleCategoryVisibility}
        onResetAllToPending={onResetAllToPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.accentRamp[100],
  },
  offlineBannerText: { fontFamily: fonts.body, fontSize: 12, color: colors.accentRamp[800] },
  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 14 },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 12.5, color: colors.text, opacity: 0.65, marginTop: 4 },
  searchIcon: { position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  emptyState: { alignItems: 'center', gap: 14, paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, opacity: 0.7, textAlign: 'center', maxWidth: 220 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  groupLabel: { fontFamily: fonts.heading, fontSize: 14, color: colors.text },
  groupCount: { fontFamily: fonts.body, fontSize: 11, color: colors.text, opacity: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  checkbox: { width: 24, height: 24, borderRadius: 999, borderWidth: 2 },
  itemName: { fontFamily: fonts.body, fontSize: 14.5, color: colors.text },
  itemSubline: { fontFamily: fonts.body, fontSize: 12, color: colors.text, opacity: 0.55, marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    height: 52,
    width: 52,
    borderRadius: 999,
    padding: 0,
  },
});
