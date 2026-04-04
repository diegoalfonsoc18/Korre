import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
  star: '#FFD700',
};

const CATEGORIES = [
  { key: 'restaurantes', icon: 'restaurant-outline' as const, label: 'Restaurantes' },
  { key: 'farmacias', icon: 'medkit-outline' as const, label: 'Farmacias' },
  { key: 'supermercado', icon: 'cart-outline' as const, label: 'Super' },
  { key: 'mascotas', icon: 'paw-outline' as const, label: 'Mascotas' },
  { key: 'licores', icon: 'wine-outline' as const, label: 'Licores' },
];

const POPULAR_RESTAURANTS = [
  {
    id: '1',
    name: 'La Vera Pizza',
    rating: 4.8,
    cuisine: 'Italiana • Pizza',
    time: '25 min',
    price: '$ - $$$',
    emoji: '🍕',
  },
  {
    id: '2',
    name: 'Home Burgers',
    rating: 4.7,
    cuisine: 'Americana • Burgers',
    time: '20 min',
    price: '$$ - $$$',
    emoji: '🍔',
  },
  {
    id: '3',
    name: 'Sano & Natural',
    rating: 4.9,
    cuisine: 'Saludable • Bowls',
    time: '30 min',
    price: '$ - $$',
    emoji: '🥗',
  },
];

export default function ClientHomeScreen() {
  const { profile } = useAuthStore();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuario';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ─── Header ─── */}
        <View
          style={{
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Avatar */}
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: COLORS.textOnPrimary, fontSize: 18, fontWeight: '800' }}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ color: COLORS.textOnSurface, fontSize: 18, fontWeight: '700' }}>
                  Hola, {firstName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
                  <Text style={{ color: COLORS.textMuted, fontSize: 13, marginLeft: 4 }}>
                    Bogota, Colombia
                  </Text>
                </View>
              </View>
            </View>

            {/* Action icons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: COLORS.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={20} color={COLORS.textOnSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: COLORS.surfaceVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={COLORS.textOnSurface} />
                {/* Notification dot */}
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 11,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FF5A5A',
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Promo Banner ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 20,
              padding: 24,
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(26,26,46,0.08)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -30,
                right: 40,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(26,26,46,0.06)',
              }}
            />
            <Text style={{ color: COLORS.textOnPrimary, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 6 }}>
              PROMOCION
            </Text>
            <Text style={{ color: COLORS.textOnPrimary, fontSize: 26, fontWeight: '900', lineHeight: 32, marginBottom: 4 }}>
              50% OFF en{'\n'}Hamburguesas
            </Text>
            <Text style={{ color: 'rgba(26,26,46,0.6)', fontSize: 14, fontWeight: '600' }}>
              Solo por hoy
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Categories ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: COLORS.textOnSurface, fontSize: 18, fontWeight: '700' }}>
              Categorias
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                style={{
                  alignItems: 'center',
                  width: 76,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: COLORS.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name={cat.icon} size={26} color={COLORS.primary} />
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(client)/mandadero')}
              style={{
                flex: 1,
                backgroundColor: COLORS.surfaceVariant,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(200,255,0,0.15)',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(200,255,0,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name="walk-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={{ color: COLORS.textOnSurface, fontSize: 14, fontWeight: '700', marginBottom: 2 }}>
                Mandadero
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Te hacemos la vuelta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: COLORS.surfaceVariant,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(200,255,0,0.15)',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(200,255,0,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={{ color: COLORS.textOnSurface, fontSize: 14, fontWeight: '700', marginBottom: 2 }}>
                Enviar paquete
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Envio rapido y seguro
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Popular Nearby ─── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: COLORS.textOnSurface, fontSize: 18, fontWeight: '700' }}>
              Populares cerca de ti
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                Explorar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14 }}>
            {POPULAR_RESTAURANTS.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  backgroundColor: COLORS.surfaceVariant,
                  borderRadius: 16,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                {/* Restaurant image placeholder */}
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    backgroundColor: COLORS.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{restaurant.emoji}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textOnSurface, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                    {restaurant.name}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 6 }}>
                    {restaurant.cuisine}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={14} color={COLORS.star} />
                      <Text style={{ color: COLORS.textOnSurface, fontSize: 13, fontWeight: '600', marginLeft: 4 }}>
                        {restaurant.rating}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={{ color: COLORS.textMuted, fontSize: 13, marginLeft: 4 }}>
                        {restaurant.time}
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                      {restaurant.price}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
