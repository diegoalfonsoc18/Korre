import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

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

export default function ClientProfileScreen() {
  const { profile, signOut } = useAuth();
  const { reset } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Cerrar sesion', '¿Estas seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          reset();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'call-outline' as const, label: 'Telefono', value: profile?.phone ?? 'No registrado', color: COLORS.primary },
    { icon: 'shield-checkmark-outline' as const, label: 'Estado', value: 'Cuenta verificada', color: COLORS.success },
    { icon: 'notifications-outline' as const, label: 'Notificaciones', value: '', color: COLORS.textOnSurface, chevron: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }}>
        <Text style={{ color: COLORS.textOnSurface, fontSize: 24, fontWeight: '800' }}>
          Mi perfil
        </Text>
      </View>

      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Text style={{ color: COLORS.textOnPrimary, fontSize: 32, fontWeight: '800' }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={{ color: COLORS.textOnSurface, fontSize: 20, fontWeight: '700' }}>
          {profile?.full_name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
            backgroundColor: 'rgba(200,255,0,0.12)',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 6 }} />
          <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>Cliente</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={item.chevron ? 0.7 : 1}
            style={{
              backgroundColor: COLORS.surfaceVariant,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: COLORS.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{item.label}</Text>
              {item.value ? (
                <Text style={{ color: item.color === COLORS.success ? COLORS.success : COLORS.textOnSurface, fontSize: 15, fontWeight: '600', marginTop: 1 }}>
                  {item.value}
                </Text>
              ) : null}
            </View>
            {item.chevron && (
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        ))}

        {/* Sign out */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSignOut}
          style={{
            backgroundColor: 'rgba(255,90,90,0.1)',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,90,90,0.2)',
          }}
        >
          <Text style={{ color: COLORS.danger, fontSize: 15, fontWeight: '700' }}>
            Cerrar sesion
          </Text>
        </TouchableOpacity>

        <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          Korre v1.0.0
        </Text>
      </View>
    </View>
  );
}
