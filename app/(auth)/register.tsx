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
import { driverService } from '@/services/driverService';
import { registerSchema, RegisterFormData } from '@/lib/validators';
import { UserRole, VehicleType } from '@/types/database.types';

const COLORS = {
  primary: '#C8FF00',
  surface: '#1A1A2E',
  surfaceVariant: '#2D2D3A',
  textOnSurface: '#FFFFFF',
  textOnPrimary: '#1A1A2E',
  textMuted: '#9E9EB0',
  error: '#FF5A5A',
};

function DarkInput({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  helper,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
  helper?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surfaceVariant,
          borderRadius: 16,
          paddingHorizontal: 16,
          borderWidth: error ? 1.5 : 0,
          borderColor: error ? COLORS.error : 'transparent',
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.textMuted}
          style={{ marginRight: 12 }}
        />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: COLORS.textOnSurface,
            paddingVertical: 15,
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {helper && !error && (
        <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4, marginLeft: 4 }}>
          {helper}
        </Text>
      )}
      {error && (
        <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function RegisterScreen() {
  const [role, setRole] = useState<UserRole>('client');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      role: 'client',
      vehicle_type: undefined,
      plate: '',
      brand: '',
      model: '',
      color: '',
    },
  });

  const vehicleType = watch('vehicle_type');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setValue('role', newRole);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await authService.signUpWithEmail(
        data.email!,
        data.password,
        data.full_name,
        data.role,
        data.phone ?? undefined
      );

      if (result.user && data.role === 'driver' && data.vehicle_type && data.plate) {
        await driverService.registerVehicle(result.user.id, {
          vehicle_type: data.vehicle_type,
          plate: data.plate,
          brand: data.brand ?? undefined,
          model: data.model ?? undefined,
          color: data.color ?? undefined,
        });
      }

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Por favor revisa tu correo para verificarla.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al registrarse';
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
        >
          {/* Header */}
          <View style={{ paddingTop: 56 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 32,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary, fontSize: 16, marginLeft: 6, fontWeight: '600' }}>
                Volver
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                color: COLORS.textOnSurface,
                fontSize: 30,
                fontWeight: '800',
                letterSpacing: -0.5,
                marginBottom: 8,
              }}
            >
              Crear cuenta
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 15,
                lineHeight: 22,
                marginBottom: 28,
              }}
            >
              Unete a Korre y empieza a pedir domicilios
            </Text>
          </View>

          {/* Selector de rol */}
          <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
            QUIERO REGISTRARME COMO
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {(['client', 'driver'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => handleRoleChange(r)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: role === r ? COLORS.primary : COLORS.surfaceVariant,
                  backgroundColor: role === r ? 'rgba(200,255,0,0.08)' : COLORS.surfaceVariant,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons
                  name={r === 'client' ? 'person-outline' : 'bicycle-outline'}
                  size={18}
                  color={role === r ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: role === r ? COLORS.primary : COLORS.textMuted,
                  }}
                >
                  {r === 'client' ? 'Cliente' : 'Conductor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Datos personales */}
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <DarkInput
                icon="person-outline"
                placeholder="Nombre completo"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.full_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <DarkInput
                icon="mail-outline"
                placeholder="Correo electronico"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <DarkInput
                icon="call-outline"
                placeholder="Telefono (opcional)"
                keyboardType="phone-pad"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.phone?.message}
                helper="Numero colombiano, ej: 3001234567"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <DarkInput
                icon="lock-closed-outline"
                placeholder="Contrasena (min 6 caracteres)"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <DarkInput
                icon="lock-closed-outline"
                placeholder="Confirmar contrasena"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.confirm_password?.message}
              />
            )}
          />

          {/* Datos del conductor */}
          {role === 'driver' && (
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: COLORS.textOnSurface,
                  fontWeight: '700',
                  fontSize: 16,
                  marginBottom: 16,
                }}
              >
                Informacion del vehiculo
              </Text>

              <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
                TIPO DE VEHICULO
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                {(['moto', 'moto_carguero'] as VehicleType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setValue('vehicle_type', type)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: vehicleType === type ? COLORS.primary : COLORS.surfaceVariant,
                      backgroundColor: vehicleType === type ? 'rgba(200,255,0,0.08)' : COLORS.surfaceVariant,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>
                      {type === 'moto' ? '🏍️' : '📦'}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '700',
                        fontSize: 13,
                        color: vehicleType === type ? COLORS.primary : COLORS.textMuted,
                      }}
                    >
                      {type === 'moto' ? 'Moto' : 'Moto Carguero'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.vehicle_type && (
                <Text style={{ color: COLORS.error, fontSize: 12, marginBottom: 8 }}>
                  {errors.vehicle_type.message}
                </Text>
              )}

              <Controller
                control={control}
                name="plate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <DarkInput
                    icon="card-outline"
                    placeholder="Placa (ej: ABC123)"
                    autoCapitalize="characters"
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    onBlur={onBlur}
                    value={value ?? ''}
                    error={errors.plate?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="brand"
                render={({ field: { onChange, onBlur, value } }) => (
                  <DarkInput
                    icon="speedometer-outline"
                    placeholder="Marca (opcional)"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
                  />
                )}
              />

              <Controller
                control={control}
                name="model"
                render={({ field: { onChange, onBlur, value } }) => (
                  <DarkInput
                    icon="construct-outline"
                    placeholder="Modelo (opcional)"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
                  />
                )}
              />

              <Controller
                control={control}
                name="color"
                render={({ field: { onChange, onBlur, value } }) => (
                  <DarkInput
                    icon="color-palette-outline"
                    placeholder="Color (opcional)"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
                  />
                )}
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: 18,
              borderRadius: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              opacity: isSubmitting ? 0.7 : 1,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.textOnPrimary} />
            ) : (
              <>
                <Text
                  style={{
                    color: COLORS.textOnPrimary,
                    fontSize: 17,
                    fontWeight: '700',
                    marginRight: 8,
                  }}
                >
                  Crear cuenta
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.textOnPrimary} />
              </>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 24,
              marginBottom: 40,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Link href="/(auth)/login">
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700' }}>
                Inicia sesion
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
