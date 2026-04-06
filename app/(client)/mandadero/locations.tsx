import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

const BOGOTA_REGION = {
  latitude: 4.7110,
  longitude: -74.0055,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();
  const [selectedMode, setSelectedMode] = useState<'pickup' | 'delivery' | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ErrandLocationFormData>({
    resolver: zodResolver(errandLocationSchema),
    defaultValues: {
      pickup_address: draft.pickupAddress,
      pickup_reference: draft.pickupReference,
      delivery_address: draft.deliveryAddress,
      delivery_reference: draft.deliveryReference,
    },
  });

  const pickupAddress = watch('pickup_address');
  const deliveryAddress = watch('delivery_address');

  const handleMapPress = (e: any) => {
    if (!selectedMode) {
      Alert.alert('Selecciona un modo', 'Presiona "Recogida" o "Entrega" primero');
      return;
    }

    const { latitude, longitude } = e.nativeEvent.coordinate;
    const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    if (selectedMode === 'pickup') {
      setPickupCoords({ latitude, longitude });
      setValue('pickup_address', address);
    } else {
      setDeliveryCoords({ latitude, longitude });
      setValue('delivery_address', address);
    }

    setSelectedMode(null);
  };

  const handleContinue = (data: ErrandLocationFormData) => {
    if (!pickupCoords || !deliveryCoords) {
      Alert.alert('Ubicaciones incompletas', 'Selecciona ambas ubicaciones en el mapa');
      return;
    }

    const km = estimateDistancePlaceholder(data.pickup_address, data.delivery_address);
    updateDraft({
      pickupAddress: data.pickup_address,
      pickupReference: data.pickup_reference ?? '',
      deliveryAddress: data.delivery_address,
      deliveryReference: data.delivery_reference ?? '',
      estimatedKm: km,
    });
    router.push('/(client)/mandadero/summary');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: colors.surface, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
            <Ionicons name="arrow-back" size={26} color={colors.textOnSurface} />
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textOnSurface, letterSpacing: -0.5 }}>
            Ubicaciones
          </Text>
        </View>

        {/* Modo selector */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setSelectedMode(selectedMode === 'pickup' ? null : 'pickup')}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: selectedMode === 'pickup' ? '#FF5A5A' : colors.surfaceVariant,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={16} color={selectedMode === 'pickup' ? '#FFFFFF' : colors.textMuted} />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                fontWeight: '700',
                color: selectedMode === 'pickup' ? '#FFFFFF' : colors.textMuted,
              }}
            >
              Recogida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMode(selectedMode === 'delivery' ? null : 'delivery')}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: selectedMode === 'delivery' ? colors.primary : colors.surfaceVariant,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="location"
              size={16}
              color={selectedMode === 'delivery' ? colors.textOnPrimary : colors.textMuted}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                fontWeight: '700',
                color: selectedMode === 'delivery' ? colors.textOnPrimary : colors.textMuted,
              }}
            >
              Entrega
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa */}
      <MapView style={{ flex: 0.55, backgroundColor: colors.surfaceVariant }} initialRegion={BOGOTA_REGION} onPress={handleMapPress}>
        {pickupCoords && <Marker coordinate={pickupCoords} title="Recogida" pinColor="#FF5A5A" />}
        {deliveryCoords && <Marker coordinate={deliveryCoords} title="Entrega" pinColor={colors.primary} />}
      </MapView>

      {/* Información de ubicaciones */}
      <ScrollView style={{ flex: 0.45, backgroundColor: colors.surface }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          {/* Recogida */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A5A', marginRight: 8 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textOnSurface }}>Recogida</Text>
            </View>

            <Controller
              control={control}
              name="pickup_address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Presiona en el mapa"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={false}
                  placeholderTextColor={colors.textMuted}
                  style={{ marginBottom: 10 }}
                />
              )}
            />

            <Controller
              control={control}
              name="pickup_reference"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Referencia (apto, piso, puerta)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
          </View>

          {/* Entrega */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 8 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textOnSurface }}>Entrega</Text>
            </View>

            <Controller
              control={control}
              name="delivery_address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Presiona en el mapa"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={false}
                  placeholderTextColor={colors.textMuted}
                  style={{ marginBottom: 10 }}
                />
              )}
            />

            <Controller
              control={control}
              name="delivery_reference"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Referencia (apto, piso, puerta)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
          </View>

          {/* Botón continuar */}
          <TouchableOpacity
            onPress={handleSubmit(handleContinue)}
            disabled={!pickupCoords || !deliveryCoords}
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: pickupCoords && deliveryCoords ? colors.primary : `${colors.primary}30`,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: pickupCoords && deliveryCoords ? colors.textOnPrimary : colors.textMuted,
              }}
            >
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
