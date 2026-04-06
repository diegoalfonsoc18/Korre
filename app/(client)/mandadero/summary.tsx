import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useErrandStore } from '@/stores/errandStore';
import { errandService } from '@/services/errandService';
import {
  calculateErrandPrice,
  formatCOP,
  ERRAND_CATEGORY_LABELS,
  ERRAND_CATEGORY_ICONS,
} from '@/lib/pricing';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
};

export default function MandaderoSummaryScreen() {
  const { profile } = useAuthStore();
  const { draft, updateDraft, setActiveErrand, resetDraft } = useErrandStore();
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
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.surface }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textOnSurface} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textOnSurface }}>
            Resumen del Mandado
          </Text>
        </View>

        {/* Resumen del mandado */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            backgroundColor: COLORS.surfaceVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name={categoryIcon} size={18} color={COLORS.textOnPrimary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textOnSurface }}>
              {ERRAND_CATEGORY_LABELS[draft.category ?? 'otro']}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 20 }}>
            {draft.description}
          </Text>
        </View>

        {/* Ruta */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            backgroundColor: COLORS.surfaceVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                marginRight: 10,
                marginTop: 5,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 2 }}>Recogida</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textOnSurface }}>
                {draft.pickupAddress}
              </Text>
            </View>
          </View>
          <View style={{ marginLeft: 4, marginBottom: 12 }}>
            <View style={{ width: 1, height: 16, backgroundColor: 'rgba(200,255,0,0.15)' }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.surfaceVariant,
                marginRight: 10,
                marginTop: 5,
                borderWidth: 2,
                borderColor: COLORS.primary,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 2 }}>Entrega</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textOnSurface }}>
                {draft.deliveryAddress}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(200,255,0,0.15)',
            }}
          >
            <Ionicons name="navigate-outline" size={14} color={COLORS.textMuted} />
            <Text style={{ fontSize: 13, marginLeft: 6, color: COLORS.textMuted }}>
              {km.toFixed(1)} km
            </Text>
          </View>
        </View>

        {/* Desglose de precio */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            backgroundColor: COLORS.surfaceVariant,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textOnSurface, marginBottom: 14 }}>
            Precio estimado
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, color: COLORS.textMuted }}>Tarifa base</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textOnSurface }}>
              {formatCOP(pricing.basePrice)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
              Distancia ({km.toFixed(1)} km)
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textOnSurface }}>
              {formatCOP(pricing.distancePrice)}
            </Text>
          </View>

          {draft.estimatedItemValue ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: COLORS.textMuted }}>Valor articulos</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textOnSurface }}>
                ~{formatCOP(draft.estimatedItemValue)}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              marginTop: 10,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(200,255,0,0.15)',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnSurface }}>
              Total estimado
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primary }}>
              {formatCOP(pricing.totalPrice)}
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>
            El valor final puede variar segun los articulos comprados
          </Text>
        </View>

        {/* Método de pago */}
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            backgroundColor: COLORS.surfaceVariant,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.surface,
                marginRight: 10,
              }}
            >
              <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textOnSurface }}>Efectivo</Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Pago al mandadero</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón confirmar */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isCreating}
          style={{
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            backgroundColor: isCreating ? 'rgba(200,255,0,0.2)' : COLORS.primary,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: isCreating ? COLORS.textMuted : COLORS.textOnPrimary }}>
            {isCreating ? 'Creando mandado...' : `Confirmar Mandado - ${formatCOP(pricing.totalPrice)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
