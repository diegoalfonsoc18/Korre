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

  const recentOrders = orderHistory?.slice(0, 3) ?? [];
  const recentErrands = errandHistory?.slice(0, 3) ?? [];
  const hasHistory = recentOrders.length > 0 || recentErrands.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ─── Header ─── */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: colors.textOnPrimary, fontSize: 18, fontWeight: '800' }}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.textOnSurface, fontSize: 18, fontWeight: '700' }}>
                  Hola, {firstName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location-sharp" size={13} color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 4 }}>
                    Bogota, Colombia
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  width: 42,
                  height: 42,
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
                  width: 42,
                  height: 42,
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
        {hasActiveOrder && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(client)/tracking')}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${colors.textOnPrimary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Ionicons name="cube" size={22} color={colors.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnPrimary, fontSize: 15, fontWeight: '700' }}>
                  Envio en curso
                </Text>
                <Text style={{ color: `${colors.textOnPrimary}99`, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                  {STATUS_LABELS[activeOrder.status] ?? activeOrder.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {hasActiveErrand && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(client)/mandadero/tracking')}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${colors.textOnPrimary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Ionicons name="walk" size={22} color={colors.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnPrimary, fontSize: 15, fontWeight: '700' }}>
                  Mandado en curso
                </Text>
                <Text style={{ color: `${colors.textOnPrimary}99`, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                  {STATUS_LABELS[activeErrand.status] ?? activeErrand.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Hero: Que necesitas? ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ color: colors.textOnSurface, fontSize: 24, fontWeight: '800', marginBottom: 16 }}>
            ¿Que necesitas hoy?
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
              borderRadius: 20,
              padding: 24,
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${colors.textOnPrimary}14`,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: `${colors.textOnPrimary}1F`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Ionicons name="cube-outline" size={26} color={colors.textOnPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnPrimary, fontSize: 20, fontWeight: '800' }}>
                  Enviar paquete
                </Text>
                <Text style={{ color: `${colors.textOnPrimary}8C`, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  Moto o moto carguero
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color={colors.textOnPrimary} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flash" size={14} color={colors.textOnPrimary} />
                <Text style={{ color: `${colors.textOnPrimary}B3`, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                  Recogida inmediata
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={14} color={colors.textOnPrimary} />
                <Text style={{ color: `${colors.textOnPrimary}B3`, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                  Envio seguro
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
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: `${colors.primary}26`,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                bottom: -20,
                right: -10,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: `${colors.primary}0A`,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: `${colors.primary}1F`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Ionicons name="walk-outline" size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textOnSurface, fontSize: 20, fontWeight: '800' }}>
                  Mandadero Digital
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '500', marginTop: 2 }}>
                  Te hacemos la vuelta que necesites
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Como funciona ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ color: colors.textOnSurface, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Como funciona
          </Text>
          <View style={{ gap: 12 }}>
            {[
              { step: '1', icon: 'location-outline' as const, title: 'Indica las direcciones', desc: 'Recogida y entrega' },
              { step: '2', icon: 'bicycle-outline' as const, title: 'Elige tu vehiculo', desc: 'Moto o moto carguero' },
              { step: '3', icon: 'checkmark-circle-outline' as const, title: 'Confirma y listo', desc: 'Un conductor lo recoge' },
            ].map((item) => (
              <View
                key={item.step}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: `${colors.primary}1F`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textOnSurface, fontSize: 14, fontWeight: '700' }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                    {item.desc}
                  </Text>
                </View>
                <Text style={{ color: `${colors.primary}4D`, fontSize: 24, fontWeight: '900' }}>
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
              <Text style={{ color: colors.textOnSurface, fontSize: 18, fontWeight: '700' }}>
                Actividad reciente
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(client)/orders')}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
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
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="cube" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textOnSurface, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                      {order.destination_address}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
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
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="walk" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textOnSurface, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                      {errand.description}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {STATUS_LABELS[errand.status] ?? errand.status}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
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
