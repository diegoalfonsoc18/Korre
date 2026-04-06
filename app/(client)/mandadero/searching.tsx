import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useErrandStore } from '@/stores/errandStore';
import { errandService } from '@/services/errandService';
import { formatCOP } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
};

export default function MandaderoSearchingScreen() {
  const { activeErrand, setActiveErrand } = useErrandStore();
  const pulse1 = useRef(new Animated.Value(0.4)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = createPulse(pulse1, 0);
    const a2 = createPulse(pulse2, 300);
    const a3 = createPulse(pulse3, 600);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  // Listen for errand status changes
  useEffect(() => {
    if (!activeErrand) return;

    const channel = supabase
      .channel(`errand-${activeErrand.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'errands',
          filter: `id=eq.${activeErrand.id}`,
        },
        (payload) => {
          const updated = payload.new as typeof activeErrand;
          setActiveErrand({ ...activeErrand, ...updated });
          if (updated.status === 'accepted') {
            router.replace('/(client)/mandadero/tracking');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeErrand?.id]);

  const handleCancel = async () => {
    if (!activeErrand) return;
    Alert.alert(
      'Cancelar mandado',
      '¿Estas seguro que quieres cancelar tu mandado?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await errandService.cancelErrand(activeErrand.id);
              setActiveErrand(null);
              router.replace('/(client)/home');
            } catch {
              Alert.alert('Error', 'No se pudo cancelar el mandado');
            }
          },
        },
      ]
    );
  };

  const km = activeErrand?.estimated_distance_km ?? 5;
  const total = activeErrand?.total_price ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
      {/* Pulse animation */}
      <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: COLORS.primary,
            opacity: pulse3,
            transform: [{ scale: pulse3 }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: COLORS.primary,
            opacity: pulse2,
            transform: [{ scale: pulse2 }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: COLORS.primary,
            opacity: pulse1,
            transform: [{ scale: pulse1 }],
          }}
        />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.primary,
          }}
        >
          <Ionicons name="bicycle-outline" size={40} color={COLORS.textOnPrimary} />
        </View>
      </View>

      {/* Text */}
      <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8, color: COLORS.textOnSurface }}>
        Buscando mandadero...
      </Text>
      <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 32, color: COLORS.textMuted }}>
        Encontrando el mejor mandadero cerca de ti
      </Text>

      {/* Info cards */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32, width: '100%' }}>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.surfaceVariant }}>
          <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
          <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: COLORS.textOnSurface }}>
            {km.toFixed(1)} km
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.surfaceVariant }}>
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: COLORS.textOnSurface }}>
            ~{Math.round(km * 5 + 10)} min
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.surfaceVariant }}>
          <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: COLORS.textOnSurface }}>
            {formatCOP(total)}
          </Text>
        </View>
      </View>

      {/* Cancel */}
      <TouchableOpacity onPress={handleCancel}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF5A5A' }}>
          Cancelar solicitud
        </Text>
      </TouchableOpacity>
    </View>
  );
}
