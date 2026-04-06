import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, WebView as RNWebView } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Input } from '@/components/ui/Input';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { errandLocationSchema, ErrandLocationFormData } from '@/lib/validators';
import { estimateDistancePlaceholder } from '@/lib/pricing';

export default function MandaderoLocationsScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [selectedMode, setSelectedMode] = useState<'pickup' | 'delivery' | null>(null);
  const [pickupCoords, setPickupCoords] = useState<string>('');
  const [deliveryCoords, setDeliveryCoords] = useState<string>('');

  const {
    control,
    handleSubmit,
    setValue,
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

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'pickup') {
        setPickupCoords(data.coords);
        setValue('pickup_address', data.coords);
      } else if (data.type === 'delivery') {
        setDeliveryCoords(data.coords);
        setValue('delivery_address', data.coords);
      }
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  };

  const handleModePress = (mode: 'pickup' | 'delivery') => {
    setSelectedMode(selectedMode === mode ? null : mode);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.setMode('${mode}');`);
    }
  };

  const handleContinue = (data: ErrandLocationFormData) => {
    if (!pickupCoords || !deliveryCoords) {
      Alert.alert('Ubicaciones incompletas', 'Selecciona ambas ubicaciones en el mapa');
      return;
    }

    const km = estimateDistancePlaceholder(pickupCoords, deliveryCoords);
    updateDraft({
      pickupAddress: pickupCoords,
      pickupReference: data.pickup_reference ?? '',
      deliveryAddress: deliveryCoords,
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
            onPress={() => handleModePress('pickup')}
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
            onPress={() => handleModePress('delivery')}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: selectedMode === 'delivery' ? '#C8FF00' : colors.surfaceVariant,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="location"
              size={16}
              color={selectedMode === 'delivery' ? '#000000' : colors.textMuted}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                fontWeight: '700',
                color: selectedMode === 'delivery' ? '#000000' : colors.textMuted,
              }}
            >
              Entrega
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa */}
      <WebView
        ref={webViewRef}
        source={require('../../assets/map.html')}
        style={{ flex: 0.55, backgroundColor: colors.surfaceVariant }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

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
              render={({ field: { value } }) => (
                <Input
                  placeholder="Presiona en el mapa"
                  value={value}
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
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8FF00', marginRight: 8 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textOnSurface }}>Entrega</Text>
            </View>

            <Controller
              control={control}
              name="delivery_address"
              render={({ field: { value } }) => (
                <Input
                  placeholder="Presiona en el mapa"
                  value={value}
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
              backgroundColor: pickupCoords && deliveryCoords ? '#C8FF00' : `${colors.primary}30`,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: pickupCoords && deliveryCoords ? '#000000' : colors.textMuted,
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
