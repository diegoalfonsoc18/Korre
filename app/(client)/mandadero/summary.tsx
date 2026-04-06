import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandService } from '@/services/errandService';
import {
  calculateErrandPrice,
  formatCOP,
  ERRAND_CATEGORY_LABELS,
  ERRAND_CATEGORY_ICONS,
} from '@/lib/pricing';

export default function MandaderoSummaryScreen() {
  const { profile } = useAuthStore();
  const { draft, updateDraft, setActiveErrand, resetDraft } = useErrandStore();
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);

  const km = draft.estimatedKm ?? 5;
  const pricing = calculateErrandPrice(km, draft.estimatedItemValue ?? undefined);
  const categoryIcon = ERRAND_CATEGORY_ICONS[draft.category ?? 'otro'] as keyof typeof Ionicons.glyphMap;

  const handleConfirm = async () => {
    if (!profile || !draft.category) return;

    setIsCreating(true);
    try {
      updateDraft({
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        totalPrice: pricing.totalPrice,
      });

      const errand = await errandService.createErrand({
        clientId: profile.id,
        category: draft.category,
        description: draft.description,
        photoUrl: draft.photoUrl ?? undefined,
        estimatedItemValue: draft.estimatedItemValue ?? undefined,
        pickupAddress: draft.pickupAddress,
        pickupReference: draft.pickupReference || undefined,
        deliveryAddress: draft.deliveryAddress,
        deliveryReference: draft.deliveryReference || undefined,
        estimatedDistanceKm: km,
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        totalPrice: pricing.totalPrice,
      });

      setActiveErrand(errand);
      resetDraft();
      router.replace('/(client)/mandadero/searching');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al crear el mandado';
      Alert.alert('Error', message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
            <Ionicons name="arrow-back" size={26} color={colors.textOnSurface} />
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textOnSurface, letterSpacing: -0.5 }}>
            Resumen
          </Text>
        </View>

        {/* Categoría y descripción */}
        <View
          style={{
            borderRadius: 18,
            padding: 20,
            marginBottom: 18,
            backgroundColor: colors.surfaceVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name={categoryIcon} size={24} color="#000000" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textOnSurface }}>
              {ERRAND_CATEGORY_LABELS[draft.category ?? 'otro']}
            </Text>
          </View>
          <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22, fontWeight: '500' }}>
            {draft.description}
          </Text>
        </View>

        {/* Ruta */}
        <View
          style={{
            borderRadius: 18,
            padding: 20,
            marginBottom: 18,
            backgroundColor: colors.surfaceVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.primary,
                marginRight: 12,
                marginTop: 6,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4, fontWeight: '700' }}>
                Recogida
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnSurface }}>
                {draft.pickupAddress}
              </Text>
            </View>
          </View>

          <View style={{ marginLeft: 5, marginBottom: 16 }}>
            <View style={{ width: 1.5, height: 20, backgroundColor: `${colors.primary}40` }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.primary,
                marginRight: 12,
                marginTop: 6,
                borderWidth: 2,
                borderColor: colors.surface,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4, fontWeight: '700' }}>
                Entrega
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnSurface }}>
                {draft.deliveryAddress}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: `${colors.primary}20`,
            }}
          >
            <Ionicons name="navigate-outline" size={14} color={colors.primary} />
            <Text style={{ fontSize: 14, marginLeft: 8, color: colors.textMuted, fontWeight: '700' }}>
              {km.toFixed(1)} km
            </Text>
          </View>
        </View>

        {/* Desglose de precio */}
        <View
          style={{
            borderRadius: 18,
            padding: 20,
            marginBottom: 18,
            backgroundColor: colors.surfaceVariant,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, marginBottom: 18 }}>
            Precio estimado
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>Tarifa base</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textOnSurface }}>
              {formatCOP(pricing.basePrice)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>
              Distancia
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textOnSurface }}>
              {formatCOP(pricing.distancePrice)}
            </Text>
          </View>

          {draft.estimatedItemValue ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>Artículos</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textOnSurface }}>
                ~{formatCOP(draft.estimatedItemValue)}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              marginTop: 14,
              paddingTop: 16,
              borderTopWidth: 1.5,
              borderTopColor: `${colors.primary}30`,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface }}>
              Total
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 }}>
              {formatCOP(pricing.totalPrice)}
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 10, fontWeight: '500' }}>
            El precio final puede variar según los artículos
          </Text>
        </View>

        {/* Método de pago */}
        <View
          style={{
            borderRadius: 18,
            padding: 18,
            marginBottom: 28,
            backgroundColor: colors.surfaceVariant,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                marginRight: 12,
              }}
            >
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textOnSurface }}>Efectivo</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '600' }}>
                Pago al mandadero
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón confirmar */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isCreating}
          style={{
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: isCreating ? `${colors.primary}30` : colors.primary,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: isCreating ? colors.textMuted : colors.textOnPrimary,
            }}
          >
            {isCreating ? 'Creando mandado...' : `Confirmar - ${formatCOP(pricing.totalPrice)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
