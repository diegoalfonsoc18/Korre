import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
};

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();

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

  const handleContinue = (data: ErrandLocationFormData) => {
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
      style={{ flex: 1, backgroundColor: COLORS.surface }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32, flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textOnSurface} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textOnSurface }}>
              Ubicaciones
            </Text>
          </View>

          {/* Mapa placeholder */}
          <View
            style={{
              height: 200,
              borderRadius: 16,
              marginBottom: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.surfaceVariant,
            }}
          >
            <Ionicons name="map-outline" size={48} color={COLORS.textMuted} />
            <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>
              Mapa proximamente
            </Text>
          </View>

          {/* Punto de recogida */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                marginRight: 10,
              }}
            />
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnSurface }}>
              Punto de Recogida
            </Text>
          </View>

          <Controller
            control={control}
            name="pickup_address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Dirección de recogida"
                multiline
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.pickup_address?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pickup_reference"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Referencia (opcional)"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
              />
            )}
          />

          {/* Línea conectora */}
          <View style={{ marginLeft: 4, marginVertical: 8 }}>
            <View style={{ width: 1, height: 20, backgroundColor: 'rgba(200,255,0,0.15)' }} />
          </View>

          {/* Punto de entrega */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.surfaceVariant,
                marginRight: 10,
              }}
            />
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnSurface }}>
              Punto de Entrega
            </Text>
          </View>

          <Controller
            control={control}
            name="delivery_address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Dirección de entrega"
                multiline
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.delivery_address?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="delivery_reference"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Referencia del destino (opcional)"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
              />
            )}
          />

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Botones */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: COLORS.surfaceVariant,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnSurface }}>
                Atras
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(handleContinue)}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: COLORS.primary,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnPrimary }}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
