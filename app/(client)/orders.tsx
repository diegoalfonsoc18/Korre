import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { orderService } from '@/services/orderService';
import { formatCOP, VEHICLE_LABELS } from '@/lib/pricing';
import { Order } from '@/types/database.types';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textMuted: '#9E9EB0',
  success: '#4ADE80',
  danger: '#FF5A5A',
  warning: '#FFB800',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: COLORS.warning },
  accepted: { label: 'Aceptado', color: COLORS.primary },
  in_transit: { label: 'En camino', color: '#60A5FA' },
  delivered: { label: 'Entregado', color: COLORS.success },
  cancelled: { label: 'Cancelado', color: COLORS.danger },
};

export default function ClientOrdersScreen() {
  const { profile } = useAuthStore();
  const { orderHistory, setOrderHistory } = useOrderStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const orders = await orderService.getClientOrders(profile.id);
        setOrderHistory(orders);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [profile, setOrderHistory]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const status = STATUS_CONFIG[item.status] ?? { label: item.status, color: COLORS.textMuted };

    return (
      <View
        style={{
          backgroundColor: COLORS.surfaceVariant,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {formatDate(item.created_at)}
          </Text>
          <View
            style={{
              backgroundColor: `${status.color}20`,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: status.color, fontSize: 12, fontWeight: '700' }}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success }} />
            <Text style={{ color: COLORS.textOnSurface, fontSize: 14, flex: 1 }} numberOfLines={1}>
              {item.origin_address}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="location" size={10} color={COLORS.primary} />
            <Text style={{ color: COLORS.textOnSurface, fontSize: 14, flex: 1 }} numberOfLines={1}>
              {item.destination_address}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.06)',
            paddingTop: 12,
          }}
        >
          <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
            {VEHICLE_LABELS[item.vehicle_type]}
          </Text>
          <Text style={{ color: COLORS.primary, fontSize: 15, fontWeight: '700' }}>
            {formatCOP(item.total_price)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
        <Text style={{ color: COLORS.textOnSurface, fontSize: 24, fontWeight: '800' }}>
          Mis pedidos
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {orderHistory.length} pedido{orderHistory.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {orderHistory.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
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
            <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
          </View>
          <Text style={{ color: COLORS.textOnSurface, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            Sin pedidos aun
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center' }}>
            Tus pedidos apareceran aqui una vez que hagas el primero.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
