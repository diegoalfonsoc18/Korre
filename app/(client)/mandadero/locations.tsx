import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const {
    control,
    handleSubmit,
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

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para usar el mapa');
        setLocationLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log('Error obteniendo ubicación:', error);
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const handleContinue = (data: ErrandLocationFormData) => {
    if (!data.pickup_address || !data.delivery_address) {
      Alert.alert('Campos incompletos', 'Completa ambas direcciones');
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

  const openMapForPickup = async () => {
    if (!userLocation) {
      Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación');
      return;
    }
    const url = `https://maps.google.com/?q=${userLocation.latitude},${userLocation.longitude}`;
    await Linking.openURL(url);
  };

  const openMapForDelivery = async () => {
    if (!userLocation) {
      Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación');
      return;
    }
    const url = `https://maps.google.com/?q=${userLocation.latitude},${userLocation.longitude}`;
    await Linking.openURL(url);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32, flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
              <Ionicons name="arrow-back" size={26} color={colors.textOnSurface} />
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textOnSurface, letterSpacing: -0.5 }}>
              Ubicaciones
            </Text>
          </View>

          {/* Ubicación actual */}
          {locationLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20, marginBottom: 28 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 14 }}>Obteniendo tu ubicación...</Text>
            </View>
          ) : userLocation ? (
            <View style={{ borderRadius: 18, padding: 16, marginBottom: 28, backgroundColor: colors.surfaceVariant, flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="location" size={22} color={colors.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMuted, marginBottom: 2 }}>Tu ubicación actual</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textOnSurface }}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Recogida */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5A5A', marginRight: 10 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, flex: 1 }}>Punto de Recogida</Text>
              <TouchableOpacity onPress={openMapForPickup} style={{ padding: 8 }}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
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
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: 10 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, flex: 1 }}>Punto de Entrega</Text>
              <TouchableOpacity onPress={openMapForDelivery} style={{ padding: 8 }}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
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

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Botón continuar */}
          <TouchableOpacity
            onPress={handleSubmit(handleContinue)}
            style={{
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: colors.textOnPrimary,
              }}
            >
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
