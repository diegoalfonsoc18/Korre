import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrderStore } from '@/stores/orderStore';
import { useRealtimeOrder } from '@/hooks/useRealtimeOrder';
import { orderService } from '@/services/orderService';
import { formatCOP, VEHICLE_LABELS } from '@/lib/pricing';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
  success: '#4ADE80',
  danger: '#FF5A5A',
  warning: '#FFB800',
};

const STATUS_CONFIG: Record<string, { label: string; desc: string; color: string; icon: string }> = {
  pending: { label: 'Buscando conductor', desc: 'Estamos buscando un mensajero disponible...', color: COLORS.warning, icon: 'search' },
  accepted: { label: 'Conductor asignado', desc: 'Tu conductor va en camino a recoger el paquete', color: COLORS.primary, icon: 'checkmark-circle' },
  in_transit: { label: 'En camino', desc: 'Tu paquete esta en camino al destino', color: '#60A5FA', icon: 'bicycle' },
  delivered: { label: 'Entregado', desc: 'Tu pedido fue entregado exitosamente', color: COLORS.success, icon: 'checkmark-done-circle' },
  cancelled: { label: 'Cancelado', desc: 'Este pedido fue cancelado', color: COLORS.danger, icon: 'close-circle' },
};

export default function TrackingScreen() {
  const { activeOrder, setActiveOrder } = useOrderStore();

  useRealtimeOrder(activeOrder?.id ?? null);

  const handleCancel = async () => {
    if (!activeOrder) return;
    Alert.alert(
      'Cancelar pedido',
      '¿Estas seguro de que quieres cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderService.cancelOrder(activeOrder.id);
              setActiveOrder(null);
              router.replace('/(client)/home');
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : 'Error al cancelar';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    const phone = activeOrder?.driver?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (!activeOrder) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
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
          <Ionicons name="location-outline" size={36} color={COLORS.textMuted} />
        </View>
        <Text style={{ color: COLORS.textOnSurface, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Sin pedido activo
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Cuando realices un pedido podras ver su estado aqui en tiempo real.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(client)/home')}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ color: COLORS.textOnPrimary, fontSize: 15, fontWeight: '700' }}>
            Hacer un pedido
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS_CONFIG[activeOrder.status] ?? { label: activeOrder.status, desc: '', color: COLORS.textMuted, icon: 'help-circle' };
  const isCompleted = activeOrder.status === 'delivered' || activeOrder.status === 'cancelled';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.surface }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}>
        {/* Header */}
        <Text style={{ color: COLORS.textOnSurface, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
          Seguimiento
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>
          Pedido #{activeOrder.id.slice(-8).toUpperCase()}
        </Text>

        {/* Status Card */}
        <View
          style={{
            backgroundColor: COLORS.surfaceVariant,
            borderRadius: 18,
            padding: 20,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: status.color,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name={status.icon as any} size={24} color={status.color} />
            <Text style={{ color: COLORS.textOnSurface, fontSize: 17, fontWeight: '700', marginLeft: 10 }}>
              {status.label}
            </Text>
          </View>
          <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
            {status.desc}
          </Text>

          {/* Driver info */}
          {activeOrder.status === 'accepted' && activeOrder.driver && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.06)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: COLORS.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.textOnSurface, fontSize: 15, fontWeight: '700' }}>
                  {activeOrder.driver.full_name}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                  {VEHICLE_LABELS[activeOrder.vehicle_type]}
                </Text>
              </View>
              {activeOrder.driver.phone && (
                <TouchableOpacity
                  onPress={handleCallDriver}
                  activeOpacity={0.7}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: 'rgba(200,255,0,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="call" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Route Card */}
        <View
          style={{
            backgroundColor: COLORS.surfaceVariant,
            borderRadius: 18,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: COLORS.textOnSurface, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            Ruta
          </Text>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ marginTop: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>Recogida</Text>
                <Text style={{ color: COLORS.textOnSurface, fontSize: 14, fontWeight: '600' }}>
                  {activeOrder.origin_address}
                </Text>
                {activeOrder.origin_reference ? (
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                    {activeOrder.origin_reference}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <Ionicons name="location" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 2 }}>Entrega</Text>
                <Text style={{ color: COLORS.textOnSurface, fontSize: 14, fontWeight: '600' }}>
                  {activeOrder.destination_address}
                </Text>
                {activeOrder.destination_reference ? (
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                    {activeOrder.destination_reference}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Price Card */}
        <View
          style={{
            backgroundColor: COLORS.surfaceVariant,
            borderRadius: 18,
            padding: 20,
            marginBottom: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: COLORS.textOnSurface, fontSize: 15, fontWeight: '600' }}>
            Total a pagar
          </Text>
          <Text style={{ color: COLORS.primary, fontSize: 22, fontWeight: '800' }}>
            {formatCOP(activeOrder.total_price)}
          </Text>
        </View>

        {/* Actions */}
        {isCompleted ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setActiveOrder(null);
              router.replace('/(client)/home');
            }}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: COLORS.textOnPrimary, fontSize: 16, fontWeight: '700' }}>
              Hacer otro pedido
            </Text>
          </TouchableOpacity>
        ) : (
          activeOrder.status === 'pending' && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCancel}
              style={{
                backgroundColor: 'rgba(255,90,90,0.12)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,90,90,0.3)',
              }}
            >
              <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: '700' }}>
                Cancelar pedido
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </ScrollView>
  );
}
