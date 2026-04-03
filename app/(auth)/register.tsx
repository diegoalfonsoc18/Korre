import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VehicleSelector } from '@/components/client/VehicleSelector';
import { authService } from '@/services/authService';
import { driverService } from '@/services/driverService';
import { registerSchema, RegisterFormData } from '@/lib/validators';
import { UserRole, VehicleType } from '@/types/database.types';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-12 pb-8">
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6"
          >
            <Text className="text-primary text-base">← Volver</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-secondary mb-1">
            Crear cuenta
          </Text>
          <Text className="text-muted mb-6">
            Únete a Korre y empieza a pedir domicilios
          </Text>

          {/* Selector de rol */}
          <Text className="text-secondary font-medium mb-2 text-sm">
            Quiero registrarme como
          </Text>
          <View className="flex-row gap-3 mb-6">
            {(['client', 'driver'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => handleRoleChange(r)}
                className={`flex-1 py-3 rounded-xl border-2 items-center ${
                  role === r
                    ? 'border-primary bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    role === r ? 'text-primary' : 'text-muted'
                  }`}
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
              <Input
                label="Nombre completo"
                placeholder="Juan García"
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
              <Input
                label="Correo electrónico"
                placeholder="tucorreo@ejemplo.com"
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
              <Input
                label="Teléfono (opcional)"
                placeholder="3001234567"
                keyboardType="phone-pad"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.phone?.message}
                helper="Número colombiano, ej: 3001234567"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
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
              <Input
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
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
            <View className="mt-2">
              <Text className="text-secondary font-bold text-base mb-3">
                Información del vehículo
              </Text>

              <Text className="text-secondary font-medium mb-2 text-sm">
                Tipo de vehículo
              </Text>
              <VehicleSelector
                value={vehicleType ?? null}
                onSelect={(type: VehicleType) => setValue('vehicle_type', type)}
              />
              {errors.vehicle_type && (
                <Text className="text-danger text-xs mt-1">
                  {errors.vehicle_type.message}
                </Text>
              )}

              <View className="mt-4">
                <Controller
                  control={control}
                  name="plate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Placa"
                      placeholder="ABC123"
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
                    <Input
                      label="Marca (opcional)"
                      placeholder="Honda, Yamaha..."
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
                    <Input
                      label="Modelo (opcional)"
                      placeholder="CB 125F..."
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
                    <Input
                      label="Color (opcional)"
                      placeholder="Rojo, negro..."
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value ?? ''}
                    />
                  )}
                />
              </View>
            </View>
          )}

          <Button
            label="Crear cuenta"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            size="lg"
            className="mt-4"
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-muted">¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-semibold">Inicia sesión</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
