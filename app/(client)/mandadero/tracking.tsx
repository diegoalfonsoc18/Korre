import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useErrandStore } from '@/stores/errandStore';
import { formatCOP, ERRAND_STATUS_LABELS, ERRAND_CATEGORY_LABELS } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';
import { Errand } from '@/types/database.types';

const STATUS_STEPS = [
  { key: 'accepted', label: 'Mandado aceptado' },
  { key: 'at_pickup', label: 'En punto de recogida' },
  { key: 'in_progress', label: 'Realizando mandado' },
  { key: 'in_transit', label: 'En camino a entrega' },
  { key: 'delivered', label: 'Entregado' },
];

function getStepState(
  stepKey: string,
  currentStatus: string
): 'done' | 'active' | 'pending' {
  const order = STATUS_STEPS.map((s) => s.key);
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function MandaderoTrackingScreen() {
  const { activeErrand, setActiveErrand } = useErrandStore();

  useEffect(() => {
    if (!activeErrand) return;

    const channel = supabase
      .channel(`errand-track-${activeErrand.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'errands',
          filter: `id=eq.${activeErrand.id}`,
        },
        (payload) => {
          const updated = payload.new as Errand;
          setActiveErrand({ ...activeErrand, ...updated });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeErrand?.id]);

  if (!activeErrand) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-5">
        <Ionicons name="checkmark-circle" size={64} color="#C8FF00" />
        <Text className="text-xl font-bold mt-4" style={{ color: '#1A1A2E' }}>
          No hay mandado activo
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(client)/home')}
          className="mt-6 py-3 px-8 rounded-xl"
          style={{ backgroundColor: '#C8FF00' }}
        >
          <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    if (activeErrand.driver?.phone) {
      Linking.openURL(`tel:${activeErrand.driver.phone}`);
    }
  };

  const isDelivered = activeErrand.status === 'delivered';
  const isCancelled = activeErrand.status === 'cancelled';

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-8">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.replace('/(client)/home')} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: '#1A1A2E' }}>
            Tu Mandado
          </Text>
        </View>

        {/* Map placeholder */}
        <View
          className="h-48 rounded-xl mb-4 items-center justify-center"
          style={{ backgroundColor: '#F0F0F0' }}
        >
          <Ionicons name="map-outline" size={48} color="#BDBDBD" />
          <Text className="text-sm mt-2" style={{ color: '#BDBDBD' }}>
            Mapa en tiempo real próximamente
          </Text>
        </View>

        {/* Driver card */}
        {activeErrand.driver && (
          <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1A1A2E' }}>
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#2D2D3A' }}
              >
                <Ionicons name="person" size={24} color="#C8FF00" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {activeErrand.driver.full_name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={12} color="#C8FF00" />
                  <Text className="text-gray-400 text-xs ml-1">4.9</Text>
                  <Ionicons name="bicycle-outline" size={12} color="#8E8E93" style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleCall}
                  className="py-2 px-4 rounded-lg"
                  style={{ backgroundColor: '#C8FF00' }}
                >
                  <Text className="text-xs font-bold" style={{ color: '#1A1A2E' }}>Llamar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-2 px-4 rounded-lg"
                  style={{ backgroundColor: '#2D2D3A' }}
                >
                  <Text className="text-xs font-bold text-white">Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Status timeline */}
        {!isCancelled && (
          <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
            <Text className="text-base font-semibold mb-4" style={{ color: '#1A1A2E' }}>
              Estado del mandado
            </Text>
            {STATUS_STEPS.map((step, index) => {
              const state = getStepState(step.key, activeErrand.status);
              return (
                <View key={step.key} className="flex-row items-start mb-4">
                  <View className="items-center mr-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{
                        backgroundColor:
                          state === 'done' ? '#C8FF00'
                          : state === 'active' ? '#C8FF00'
                          : '#E0E0E0',
                      }}
                    >
                      {state === 'done' ? (
                        <Ionicons name="checkmark" size={14} color="#1A1A2E" />
                      ) : state === 'active' ? (
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1A1A2E' }} />
                      ) : (
                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#BDBDBD' }} />
                      )}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          height: 24,
                          backgroundColor: state === 'done' ? '#C8FF00' : '#E0E0E0',
                        }}
                      />
                    )}
                  </View>
                  <View className="flex-1 pt-0.5">
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: state === 'pending' ? '#BDBDBD' : '#1A1A2E',
                      }}
                    >
                      {step.label}
                    </Text>
                    {state === 'active' && (
                      <Text className="text-xs mt-0.5" style={{ color: '#8E8E93' }}>
                        {ERRAND_STATUS_LABELS[activeErrand.status]}...
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Cancelled state */}
        {isCancelled && (
          <View className="rounded-xl p-4 mb-4 items-center" style={{ backgroundColor: '#FFF0F0' }}>
            <Ionicons name="close-circle" size={48} color="#E74C3C" />
            <Text className="text-base font-bold mt-2" style={{ color: '#E74C3C' }}>
              Mandado cancelado
            </Text>
          </View>
        )}

        {/* Evidence photos */}
        {activeErrand.evidence_photos && activeErrand.evidence_photos.length > 0 && (
          <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
            <Text className="text-base font-semibold mb-3" style={{ color: '#1A1A2E' }}>
              Evidencia
            </Text>
            <View className="flex-row gap-2">
              {activeErrand.evidence_photos.map((_, idx) => (
                <View
                  key={idx}
                  className="w-16 h-16 rounded-lg items-center justify-center"
                  style={{ backgroundColor: '#E0E0E0' }}
                >
                  <Ionicons name="image-outline" size={24} color="#8E8E93" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mandado summary */}
        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={16} color="#8E8E93" />
              <Text className="text-sm ml-2" style={{ color: '#8E8E93' }}>
                {ERRAND_CATEGORY_LABELS[activeErrand.category]} — {formatCOP(activeErrand.total_price)}
              </Text>
            </View>
          </View>
          <Text className="text-xs mt-2" style={{ color: '#BDBDBD' }}>
            {activeErrand.pickup_address} → {activeErrand.delivery_address}
          </Text>
        </View>

        {/* Delivered state */}
        {isDelivered && (
          <TouchableOpacity
            onPress={() => {
              setActiveErrand(null);
              router.replace('/(client)/home');
            }}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: '#C8FF00' }}
          >
            <Text className="text-base font-bold" style={{ color: '#1A1A2E' }}>
              Volver al inicio
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
