import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

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
      className="flex-1 bg-white"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="px-5 pt-14 pb-8 flex-1">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: '#1A1A2E' }}>
              Ubicaciones
            </Text>
          </View>

          {/* Mapa placeholder */}
          <View
            className="h-48 rounded-xl mb-6 items-center justify-center"
            style={{ backgroundColor: '#F0F0F0' }}
          >
            <Ionicons name="map-outline" size={48} color="#BDBDBD" />
            <Text className="text-sm mt-2" style={{ color: '#BDBDBD' }}>
              Mapa próximamente
            </Text>
          </View>

          {/* Punto de recogida */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: '#C8FF00' }}
            />
            <Text className="text-base font-semibold" style={{ color: '#1A1A2E' }}>
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
          <View className="ml-1.5 my-1">
            <View style={{ width: 1, height: 20, backgroundColor: '#E0E0E0', marginLeft: 4 }} />
          </View>

          {/* Punto de entrega */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: '#1A1A2E' }}
            />
            <Text className="text-base font-semibold" style={{ color: '#1A1A2E' }}>
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
          <View className="flex-1" />

          {/* Botones */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: '#F5F5F5' }}
            >
              <Text className="text-base font-semibold" style={{ color: '#1A1A2E' }}>
                Atrás
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(handleContinue)}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: '#C8FF00' }}
            >
              <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
