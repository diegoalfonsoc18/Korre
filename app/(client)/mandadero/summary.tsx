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
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-8">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: '#1A1A2E' }}>
            Resumen del Mandado
          </Text>
        </View>

        {/* Resumen del mandado */}
        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1A1A2E' }}>
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: '#C8FF00' }}
            >
              <Ionicons name={categoryIcon} size={18} color="#1A1A2E" />
            </View>
            <Text className="text-base font-semibold text-white">
              {ERRAND_CATEGORY_LABELS[draft.category ?? 'otro']}
            </Text>
          </View>
          <Text className="text-sm text-gray-300 leading-5">
            {draft.description}
          </Text>
        </View>

        {/* Ruta */}
        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
          <View className="flex-row items-start mb-3">
            <View className="w-3 h-3 rounded-full mt-1 mr-3" style={{ backgroundColor: '#C8FF00' }} />
            <View className="flex-1">
              <Text className="text-xs" style={{ color: '#8E8E93' }}>Recogida</Text>
              <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                {draft.pickupAddress}
              </Text>
            </View>
          </View>
          <View className="ml-1.5 mb-3">
            <View style={{ width: 1, height: 16, backgroundColor: '#E0E0E0', marginLeft: 4 }} />
          </View>
          <View className="flex-row items-start">
            <View className="w-3 h-3 rounded-full mt-1 mr-3" style={{ backgroundColor: '#1A1A2E' }} />
            <View className="flex-1">
              <Text className="text-xs" style={{ color: '#8E8E93' }}>Entrega</Text>
              <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                {draft.deliveryAddress}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
            <Ionicons name="navigate-outline" size={14} color="#8E8E93" />
            <Text className="text-sm ml-1" style={{ color: '#8E8E93' }}>
              {km.toFixed(1)} km
            </Text>
          </View>
        </View>

        {/* Desglose de precio */}
        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
          <Text className="text-base font-semibold mb-3" style={{ color: '#1A1A2E' }}>
            Precio estimado
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: '#8E8E93' }}>Tarifa base</Text>
            <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
              {formatCOP(pricing.basePrice)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: '#8E8E93' }}>
              Distancia ({km.toFixed(1)} km)
            </Text>
            <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
              {formatCOP(pricing.distancePrice)}
            </Text>
          </View>

          {draft.estimatedItemValue ? (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: '#8E8E93' }}>Valor artículos</Text>
              <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                ~{formatCOP(draft.estimatedItemValue)}
              </Text>
            </View>
          ) : null}

          <View className="mt-2 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
            <View className="flex-row justify-between">
              <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
                Total estimado
              </Text>
              <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
                {formatCOP(pricing.totalPrice)}
              </Text>
            </View>
          </View>

          <Text className="text-xs mt-2" style={{ color: '#BDBDBD' }}>
            El valor final puede variar según los artículos comprados
          </Text>
        </View>

        {/* Método de pago */}
        <View className="rounded-xl p-4 mb-6 flex-row items-center justify-between" style={{ backgroundColor: '#F5F5F5' }}>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: '#1A1A2E' }}>
              <Ionicons name="wallet-outline" size={16} color="#C8FF00" />
            </View>
            <View>
              <Text className="text-sm font-medium" style={{ color: '#1A1A2E' }}>Efectivo</Text>
              <Text className="text-xs" style={{ color: '#8E8E93' }}>Pago al mandadero</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text className="text-sm font-medium" style={{ color: '#C8FF00' }}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón confirmar */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isCreating}
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: isCreating ? '#E0E0E0' : '#C8FF00' }}
        >
          <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
            {isCreating ? 'Creando mandado...' : `Confirmar Mandado - ${formatCOP(pricing.totalPrice)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
