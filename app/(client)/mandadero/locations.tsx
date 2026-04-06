import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();

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

          {/* Recogida */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5A5A', marginRight: 10 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface }}>Punto de Recogida</Text>
            </View>

            <Controller
              control={control}
              name="pickup_address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Dirección de recogida (ej: Carrera 7 #45-89)"
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
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface }}>Punto de Entrega</Text>
            </View>

            <Controller
              control={control}
              name="delivery_address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Dirección de entrega (ej: Calle 12 #34-56)"
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
