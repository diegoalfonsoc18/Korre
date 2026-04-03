import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useErrandStore } from '@/stores/errandStore';
import { errandService } from '@/services/errandService';
import { formatCOP } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';

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
      '¿Estás seguro que quieres cancelar tu mandado?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
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
    <View className="flex-1 bg-white items-center justify-center px-5">
      {/* Pulse animation */}
      <View className="w-48 h-48 items-center justify-center mb-8">
        <Animated.View
          className="absolute w-48 h-48 rounded-full"
          style={{ backgroundColor: '#C8FF00', opacity: pulse3, transform: [{ scale: pulse3 }] }}
        />
        <Animated.View
          className="absolute w-36 h-36 rounded-full"
          style={{ backgroundColor: '#C8FF00', opacity: pulse2, transform: [{ scale: pulse2 }] }}
        />
        <Animated.View
          className="absolute w-24 h-24 rounded-full"
          style={{ backgroundColor: '#C8FF00', opacity: pulse1, transform: [{ scale: pulse1 }] }}
        />
        <View
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: '#C8FF00' }}
        >
          <Ionicons name="bicycle-outline" size={36} color="#1A1A2E" />
        </View>
      </View>

      {/* Text */}
      <Text className="text-2xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
        Buscando mandadero...
      </Text>
      <Text className="text-sm text-center mb-8" style={{ color: '#8E8E93' }}>
        Encontrando el mejor mandadero cerca de ti
      </Text>

      {/* Info cards */}
      <View className="flex-row gap-4 mb-12">
        <View className="flex-1 items-center py-3 rounded-xl" style={{ backgroundColor: '#F5F5F5' }}>
          <Ionicons name="navigate-outline" size={18} color="#8E8E93" />
          <Text className="text-sm font-semibold mt-1" style={{ color: '#1A1A2E' }}>
            {km.toFixed(1)} km
          </Text>
        </View>
        <View className="flex-1 items-center py-3 rounded-xl" style={{ backgroundColor: '#F5F5F5' }}>
          <Ionicons name="time-outline" size={18} color="#8E8E93" />
          <Text className="text-sm font-semibold mt-1" style={{ color: '#1A1A2E' }}>
            ~{Math.round(km * 5 + 10)} min
          </Text>
        </View>
        <View className="flex-1 items-center py-3 rounded-xl" style={{ backgroundColor: '#F5F5F5' }}>
          <Ionicons name="wallet-outline" size={18} color="#8E8E93" />
          <Text className="text-sm font-semibold mt-1" style={{ color: '#1A1A2E' }}>
            {formatCOP(total)}
          </Text>
        </View>
      </View>

      {/* Cancel */}
      <TouchableOpacity onPress={handleCancel}>
        <Text className="text-sm font-medium" style={{ color: '#E74C3C' }}>
          Cancelar solicitud
        </Text>
      </TouchableOpacity>
    </View>
  );
}
