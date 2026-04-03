import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/authService';
import { loginSchema, LoginFormData } from '@/lib/validators';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
  error: '#FF5A5A',
};

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
        error instanceof Error ? error.message : 'Error al iniciar sesion';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ─── Top Branding ─── */}
          <View style={{ paddingTop: 72, marginBottom: 48 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: COLORS.textOnPrimary,
                    fontSize: 22,
                    fontWeight: '900',
                  }}
                >
                  K
                </Text>
              </View>
              <Text
                style={{
                  color: COLORS.textOnSurface,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                Korre
              </Text>
            </View>

            {/* Headline */}
            <Text
              style={{
                color: COLORS.textOnSurface,
                fontSize: 32,
                fontWeight: '800',
                lineHeight: 38,
                letterSpacing: -0.5,
                marginBottom: 8,
              }}
            >
              Iniciar Sesion
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Ingresa tus datos para continuar
            </Text>
          </View>

          {/* ─── Email Input ─── */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surfaceVariant,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: errors.email ? 1.5 : 0,
                borderColor: errors.email ? COLORS.error : 'transparent',
              }}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textMuted}
                style={{ marginRight: 12 }}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: COLORS.textOnSurface,
                      paddingVertical: 16,
                    }}
                    placeholder="Correo electronico"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.email && (
              <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* ─── Password Input ─── */}
          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surfaceVariant,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: errors.password ? 1.5 : 0,
                borderColor: errors.password ? COLORS.error : 'transparent',
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textMuted}
                style={{ marginRight: 12 }}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: COLORS.textOnSurface,
                      paddingVertical: 16,
                    }}
                    placeholder="Contrasena"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* ─── Forgot Password ─── */}
          <View style={{ alignItems: 'flex-end', marginBottom: 28 }}>
            <Link href="/(auth)/forgot-password">
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                Olvidaste tu contrasena?
              </Text>
            </Link>
          </View>

          {/* ─── Login Button ─── */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 24,
              paddingVertical: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting ? 0.6 : 1,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.textOnPrimary} size="small" />
            ) : (
              <>
                <Text
                  style={{
                    color: COLORS.textOnPrimary,
                    fontSize: 17,
                    fontWeight: '800',
                    letterSpacing: 0.3,
                    marginRight: 8,
                  }}
                >
                  Iniciar sesion
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.textOnPrimary} />
              </>
            )}
          </TouchableOpacity>

          {/* ─── Divider ─── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 32,
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: '#3D3D4E' }} />
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 13,
                marginHorizontal: 16,
                fontWeight: '500',
              }}
            >
              o continua con
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#3D3D4E' }} />
          </View>

          {/* ─── Social Buttons ─── */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                paddingVertical: 15,
                borderRadius: 20,
              }}
            >
              <Ionicons name="logo-google" size={20} color="#2C3E50" style={{ marginRight: 8 }} />
              <Text style={{ color: '#2C3E50', fontSize: 15, fontWeight: '600' }}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                paddingVertical: 15,
                borderRadius: 20,
              }}
            >
              <Ionicons name="logo-apple" size={22} color="#2C3E50" style={{ marginRight: 8 }} />
              <Text style={{ color: '#2C3E50', fontSize: 15, fontWeight: '600' }}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Register Footer ─── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 36,
              marginBottom: 40,
              paddingVertical: 16,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>No tienes cuenta? </Text>
            <Link href="/(auth)/register">
              <Text style={{ color: COLORS.primary, fontSize: 15, fontWeight: '800' }}>
                Registrate
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
