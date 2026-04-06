import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

const BOGOTA_COORDS = {
  latitude: 4.7110,
  longitude: -74.0055,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();
  const [selectedMode, setSelectedMode] = useState<'pickup' | 'delivery' | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
        setUserLocation(BOGOTA_COORDS);
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setLocationLoading(false);
    })();
  }, []);

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
      Alert.alert('Selecciona un modo', 'Toca "Recogida" o "Entrega" primero');
      return;
    }

    const { latitude, longitude } = e.nativeEvent.coordinate;
    const addressName = selectedMode === 'pickup' ? `Recogida (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : `Entrega (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    if (selectedMode === 'pickup') {
      setPickupCoords({ latitude, longitude });
      setValue('pickup_address', addressName);
      setSelectedMode(null);
    } else {
      setDeliveryCoords({ latitude, longitude });
      setValue('delivery_address', addressName);
      setSelectedMode(null);
    }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: colors.surface, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={26} color={colors.textOnSurface} />
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textOnSurface, letterSpacing: -0.5 }}>
              Ubicaciones
            </Text>
          </View>
        </View>

        {/* Mapa */}
        {locationLoading ? (
          <View style={{ flex: 0.5, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>Obteniendo ubicación...</Text>
          </View>
        ) : (
          <MapView
            style={{ flex: 0.5, backgroundColor: colors.surfaceVariant }}
            initialRegion={userLocation || BOGOTA_COORDS}
            onPress={handleMapPress}
          >
            {userLocation && (
              <Marker
                coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                title="Tu ubicación"
                pinColor={colors.primary}
              />
            )}
            {pickupCoords && <Marker coordinate={pickupCoords} title="Recogida" pinColor="#FF5A5A" />}
            {deliveryCoords && <Marker coordinate={deliveryCoords} title="Entrega" pinColor={colors.primary} />}
          </MapView>
        )}

        {/* Controles de modo */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setSelectedMode(selectedMode === 'pickup' ? null : 'pickup')}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: selectedMode === 'pickup' ? '#FF5A5A' : colors.surfaceVariant,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={18} color={selectedMode === 'pickup' ? '#FFFFFF' : colors.textMuted} />
            <Text style={{ marginLeft: 8, fontWeight: '700', color: selectedMode === 'pickup' ? '#FFFFFF' : colors.textMuted }}>
              Recogida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMode(selectedMode === 'delivery' ? null : 'delivery')}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: selectedMode === 'delivery' ? colors.primary : colors.surfaceVariant,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={18} color={selectedMode === 'delivery' ? colors.textOnPrimary : colors.textMuted} />
            <Text style={{ marginLeft: 8, fontWeight: '700', color: selectedMode === 'delivery' ? colors.textOnPrimary : colors.textMuted }}>
              Entrega
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información de ubicaciones */}
        <ScrollView style={{ flex: 0.5, backgroundColor: colors.surface }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}>
            {/* Recogida */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5A5A', marginRight: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface }}>Punto de Recogida</Text>
              </View>

              <Controller
                control={control}
                name="pickup_address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Dirección de recogida"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={false}
                    placeholderTextColor={colors.textMuted}
                    style={{ marginBottom: 12 }}
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
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginRight: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface }}>Punto de Entrega</Text>
              </View>

              <Controller
                control={control}
                name="delivery_address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Dirección de entrega"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={false}
                    placeholderTextColor={colors.textMuted}
                    style={{ marginBottom: 12 }}
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
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: pickupCoords && deliveryCoords ? colors.primary : `${colors.primary}30`,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
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
    </KeyboardAvoidingView>
  );
}
