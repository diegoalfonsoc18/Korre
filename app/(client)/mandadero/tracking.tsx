import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useErrandStore } from '@/stores/errandStore';
import { formatCOP, ERRAND_STATUS_LABELS, ERRAND_CATEGORY_LABELS } from '@/lib/pricing';
import { supabase } from '@/lib/supabase';
import { Errand } from '@/types/database.types';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
  success: '#4ADE80',
  danger: '#FF5A5A',
};

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
      <View style={{ flex: 1, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: COLORS.surfaceVariant,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Ionicons name="checkmark-circle" size={40} color={COLORS.primary} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 24, color: COLORS.textOnSurface }}>
          No hay mandado activo
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(client)/home')}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textOnPrimary }}>
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
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.surface }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.replace('/(client)/home')} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textOnSurface} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textOnSurface }}>
            Tu Mandado
          </Text>
        </View>

        {/* Map placeholder */}
        <View
          style={{
            height: 200,
            borderRadius: 16,
            marginBottom: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.surfaceVariant,
          }}
        >
          <Ionicons name="map-outline" size={48} color={COLORS.textMuted} />
          <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>
            Mapa en tiempo real proximamente
          </Text>
        </View>

        {/* Driver card */}
        {activeErrand.driver && (
          <View style={{ borderRadius: 16, padding: 16, marginBottom: 16, backgroundColor: COLORS.surfaceVariant }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  backgroundColor: COLORS.surface,
                }}
              >
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.textOnSurface, fontSize: 16, fontWeight: '700' }}>
                  {activeErrand.driver.full_name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="star" size={12} color={COLORS.primary} />
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 4 }}>4.9</Text>
                  <Ionicons name="bicycle-outline" size={12} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={handleCall}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: COLORS.primary,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textOnPrimary }}>
                    Llamar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textOnSurface }}>
                    Chat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Status timeline */}
        {!isCancelled && (
          <View style={{ borderRadius: 16, padding: 16, marginBottom: 16, backgroundColor: COLORS.surfaceVariant }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 16, color: COLORS.textOnSurface }}>
              Estado del mandado
            </Text>
            {STATUS_STEPS.map((step, index) => {
              const state = getStepState(step.key, activeErrand.status);
              return (
                <View key={step.key} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ alignItems: 'center', marginRight: 12 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          state === 'done' ? COLORS.success
                          : state === 'active' ? COLORS.primary
                          : COLORS.surface,
                      }}
                    >
                      {state === 'done' ? (
                        <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />
                      ) : state === 'active' ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textOnPrimary }} />
                      ) : (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted }} />
                      )}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          height: 24,
                          backgroundColor: state === 'done' || state === 'active' ? COLORS.primary : COLORS.surface,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: state === 'pending' ? COLORS.textMuted : COLORS.textOnSurface,
                      }}
                    >
                      {step.label}
                    </Text>
                    {state === 'active' && (
                      <Text style={{ fontSize: 12, marginTop: 2, color: COLORS.textMuted }}>
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
          <View style={{ borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center', backgroundColor: 'rgba(255,90,90,0.1)', borderWidth: 1, borderColor: 'rgba(255,90,90,0.2)' }}>
            <Ionicons name="close-circle" size={48} color={COLORS.danger} />
            <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 8, color: COLORS.danger }}>
              Mandado cancelado
            </Text>
          </View>
        )}

        {/* Evidence photos */}
        {activeErrand.evidence_photos && activeErrand.evidence_photos.length > 0 && (
          <View style={{ borderRadius: 16, padding: 16, marginBottom: 16, backgroundColor: COLORS.surfaceVariant }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: COLORS.textOnSurface }}>
              Evidencia
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {activeErrand.evidence_photos.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mandado summary */}
        <View style={{ borderRadius: 16, padding: 16, marginBottom: 16, backgroundColor: COLORS.surfaceVariant }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={16} color={COLORS.textMuted} />
              <Text style={{ fontSize: 13, marginLeft: 8, color: COLORS.textMuted }}>
                {ERRAND_CATEGORY_LABELS[activeErrand.category]} — {formatCOP(activeErrand.total_price)}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, marginTop: 8, color: COLORS.textMuted }}>
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
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: COLORS.primary,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textOnPrimary }}>
              Volver al inicio
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
