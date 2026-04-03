import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { loginSchema, LoginFormData } from '@/lib/validators';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await authService.signInWithEmail(data.email, data.password);
      router.replace('/');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      Alert.alert('Error', message);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFFBF7' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ─── HERO: Vibrant orange gradient header ─── */}
          <View
            style={{
              backgroundColor: '#FF6B35',
              paddingTop: 64,
              paddingBottom: 48,
              paddingHorizontal: 28,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              // Layered shadow for depth
              shadowColor: '#FF6B35',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 28,
              elevation: 16,
            }}
          >
            {/* Decorative circles — overlapping bg shapes */}
            <View
              style={{
                position: 'absolute',
                top: -30,
                right: -40,
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />

            {/* Logo row */}
            <View className="flex-row items-center mb-10">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>K</Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '600' }}>
                  Domicilios
                </Text>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: -1 }}>
                  Korre
                </Text>
              </View>
            </View>

            {/* Headline */}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 36,
                fontWeight: '900',
                lineHeight: 42,
                letterSpacing: -0.5,
              }}
            >
              Bienvenido{'\n'}de vuelta
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 15,
                marginTop: 10,
                lineHeight: 22,
              }}
            >
              Tus envíos te están esperando 📦
            </Text>
          </View>

          {/* ─── FORM CARD: Floating white card ─── */}
          <View
            style={{
              marginTop: -20,
              marginHorizontal: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 28,
              // Card shadow
              shadowColor: '#1A252F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  icon="✉️"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  icon="🔑"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            {/* Row: show password + forgot */}
            <View className="flex-row justify-between items-center" style={{ marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: showPassword ? '#FF6B35' : '#D5D5DA',
                    backgroundColor: showPassword ? '#FF6B35' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  {showPassword && (
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>✓</Text>
                  )}
                </View>
                <Text style={{ color: '#2C3E50', fontSize: 14 }}>Mostrar</Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password">
                <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '600' }}>
                  ¿Olvidaste tu clave?
                </Text>
              </Link>
            </View>

            {/* Primary CTA */}
            <Button
              label="Iniciar sesión"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
              icon="→"
              iconPosition="right"
            />
          </View>

          {/* ─── SOCIAL SECTION ─── */}
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            {/* Divider */}
            <View className="flex-row items-center" style={{ marginBottom: 20 }}>
              <View className="flex-1" style={{ height: 1, backgroundColor: '#EDE8E2' }} />
              <Text style={{ color: '#8E8E93', fontSize: 12, marginHorizontal: 16, fontWeight: '500' }}>
                O CONTINÚA CON
              </Text>
              <View className="flex-1" style={{ height: 1, backgroundColor: '#EDE8E2' }} />
            </View>

            {/* Social Row */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: '#EDEDED',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🇬</Text>
                <Text style={{ color: '#2C3E50', fontSize: 15, fontWeight: '600' }}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center"
                style={{
                  backgroundColor: '#2C3E50',
                  paddingVertical: 14,
                  borderRadius: 16,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>🍎</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── REGISTER FOOTER ─── */}
          <View
            className="flex-row justify-center items-center"
            style={{
              marginTop: 32,
              marginBottom: 40,
              paddingVertical: 18,
              marginHorizontal: 16,
              backgroundColor: '#FFF5EF',
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#8E8E93', fontSize: 15 }}>¿Sin cuenta? </Text>
            <Link href="/(auth)/register">
              <Text style={{ color: '#FF6B35', fontSize: 15, fontWeight: '800' }}>
                Regístrate gratis
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
