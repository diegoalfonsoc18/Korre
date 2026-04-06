import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Buscando conductor',
  accepted: 'Conductor asignado',
  in_transit: 'En camino',
  searching: 'Buscando mandadero',
  at_pickup: 'En punto de recogida',
  in_progress: 'En progreso',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function ClientHomeScreen() {
  const { profile } = useAuthStore();
  const { activeOrder, orderHistory } = useOrderStore();
  const { activeErrand, errandHistory } = useErrandStore();
  const { colors, theme, toggleTheme } = useTheme();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuario';

  const hasActiveOrder = activeOrder && !['delivered', 'cancelled'].includes(activeOrder.status);
  const hasActiveErrand = activeErrand && !['delivered', 'cancelled'].includes(activeErrand.status);

  const recentOrders = orderHistory?.slice(0, 2) ?? [];
  const recentErrands = errandHistory?.slice(0, 2) ?? [];
  const hasHistory = recentOrders.length > 0 || recentErrands.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ─── Header ─── */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Text style={{ color: colors.textOnPrimary, fontSize: 18, fontWeight: '900' }}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.textOnSurface, fontSize: 20, fontWeight: '900' }}>
                  Hola, {firstName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Ionicons name="location-sharp" size={12} color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>
                    Bogota, Colombia
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.textOnSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(client)/orders')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="receipt-outline" size={20} color={colors.textOnSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Active Order/Errand Banner ─── */}
        {(hasActiveOrder || hasActiveErrand) && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32, gap: 10 }}>
            {hasActiveOrder && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(client)/tracking')}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 18,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: `${colors.textOnPrimary}18`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="cube" size={24} color={colors.textOnPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textOnPrimary, fontSize: 16, fontWeight: '800' }}>
                    Envío en curso
                  </Text>
                  <Text style={{ color: `${colors.textOnPrimary}BB`, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                    {STATUS_LABELS[activeOrder.status] ?? activeOrder.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textOnPrimary} />
              </TouchableOpacity>
            )}

            {hasActiveErrand && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(client)/mandadero/tracking')}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 18,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: `${colors.textOnPrimary}18`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="walk" size={24} color={colors.textOnPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textOnPrimary, fontSize: 16, fontWeight: '800' }}>
                    Mandado en curso
                  </Text>
                  <Text style={{ color: `${colors.textOnPrimary}BB`, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                    {STATUS_LABELS[activeErrand.status] ?? activeErrand.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textOnPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── Hero: Que necesitas? ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 36 }}>
          <Text style={{ color: colors.textOnSurface, fontSize: 28, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 }}>
            ¿Qué necesitas?
          </Text>

          {/* Enviar paquete - Card principal */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              useOrderStore.getState().resetDraft();
              router.push('/(client)/tracking');
            }}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 22,
              padding: 28,
              marginBottom: 14,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: `${colors.textOnPrimary}10`,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: `${colors.textOnPrimary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons name="cube-outline" size={28} color={colors.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnPrimary, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 }}>
                  Enviar paquete
                </Text>
                <Text style={{ color: `${colors.textOnPrimary}99`, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  Moto o moto carguero
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flash" size={14} color={colors.textOnPrimary} />
                <Text style={{ color: `${colors.textOnPrimary}CC`, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                  Inmediato
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={14} color={colors.textOnPrimary} />
                <Text style={{ color: `${colors.textOnPrimary}CC`, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                  Seguro
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Mandadero Digital */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              useErrandStore.getState().resetDraft();
              router.push('/(client)/mandadero');
            }}
            style={{
              backgroundColor: colors.surfaceVariant,
              borderRadius: 22,
              padding: 28,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                bottom: -30,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${colors.primary}08`,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: `${colors.primary}18`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Ionicons name="walk-outline" size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnSurface, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 }}>
                  Mandadero Digital
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  Te hacemos el favor
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Como funciona ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 36 }}>
          <Text style={{ color: colors.textOnSurface, fontSize: 20, fontWeight: '900', marginBottom: 18 }}>
            Cómo funciona
          </Text>
          <View style={{ gap: 12 }}>
            {[
              { step: '1', icon: 'location-outline' as const, title: 'Ubica las direcciones', desc: 'Recogida y entrega' },
              { step: '2', icon: 'bicycle-outline' as const, title: 'Elige tu vehículo', desc: 'Moto o carguero' },
              { step: '3', icon: 'checkmark-circle-outline' as const, title: 'Confirma y listo', desc: 'Un conductor lo recoge' },
            ].map((item) => (
              <View
                key={item.step}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${colors.primary}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textOnSurface, fontSize: 15, fontWeight: '800' }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: '500' }}>
                    {item.desc}
                  </Text>
                </View>
                <Text style={{ color: `${colors.primary}40`, fontSize: 28, fontWeight: '900' }}>
                  {item.step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Recent Activity ─── */}
        {hasHistory && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.textOnSurface, fontSize: 20, fontWeight: '900' }}>
                Reciente
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(client)/orders')}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
                  Ver todo
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              {recentOrders.map((order) => (
                <View
                  key={order.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="cube" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textOnSurface, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                      {order.destination_address}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '800' }}>
                    ${order.total_price?.toLocaleString('es-CO') ?? '—'}
                  </Text>
                </View>
              ))}

              {recentErrands.map((errand) => (
                <View
                  key={errand.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="walk" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textOnSurface, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                      {errand.description}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {STATUS_LABELS[errand.status] ?? errand.status}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '800' }}>
                    ${errand.total_price?.toLocaleString('es-CO') ?? '—'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
