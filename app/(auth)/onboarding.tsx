import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  subtitle: '#9CA3AF',
};

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        {/* Brand name */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: COLORS.primary,
            textAlign: 'center',
            letterSpacing: 1,
          }}
        >
          Korre
        </Text>

        {/* Illustration area */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: COLORS.surfaceVariant,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 80 }}>🏍️</Text>
          </View>

          {/* PREMIUM badge */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: COLORS.primary,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: COLORS.textOnPrimary,
                letterSpacing: 2,
              }}
            >
              PREMIUM
            </Text>
          </View>
        </View>

        {/* Headline */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            color: COLORS.textOnSurface,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Tus domicilios,{'\n'}al instante
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 16,
            color: COLORS.subtitle,
            textAlign: 'center',
            marginBottom: 40,
            lineHeight: 24,
          }}
        >
          La comida que amas, entregada con estilo
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 18,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.textOnPrimary,
              marginRight: 8,
            }}
          >
            Comenzar
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.textOnPrimary} />
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.7}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, color: COLORS.subtitle }}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              Inicia sesión
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
