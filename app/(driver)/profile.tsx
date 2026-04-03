import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { driverService } from '@/services/driverService';
import { Vehicle } from '@/types/database.types';
import { VEHICLE_LABELS } from '@/lib/pricing';

export default function DriverProfileScreen() {
  const { profile, signOut } = useAuth();
  const { reset } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!profile) return;
    driverService.getDriverVehicles(profile.id).then(setVehicles);
  }, [profile]);

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
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

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-6">
        <Text className="text-2xl font-bold text-secondary">Mi perfil</Text>
      </View>

      {/* Avatar */}
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-secondary font-bold text-xl">{profile?.full_name}</Text>
        <View className="flex-row items-center gap-1 mt-1">
          <View className="w-2 h-2 rounded-full bg-secondary" />
          <Text className="text-muted text-sm">Conductor</Text>
        </View>
      </View>

      <View className="px-5 gap-3">
        {/* Teléfono */}
        {profile?.phone && (
          <Card>
            <View className="flex-row items-center gap-3">
              <Ionicons name="call-outline" size={20} color="#2C3E50" />
              <View>
                <Text className="text-muted text-xs">Teléfono</Text>
                <Text className="text-secondary font-medium">{profile.phone}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Vehículos */}
        {vehicles.length > 0 && (
          <Card>
            <Text className="font-bold text-secondary mb-3">Mis vehículos</Text>
            {vehicles.map((v) => (
              <View key={v.id} className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                  <MaterialCommunityIcons
                    name="motorbike"
                    size={20}
                    color="#2C3E50"
                  />
                </View>
                <View>
                  <Text className="text-secondary font-semibold">
                    {VEHICLE_LABELS[v.vehicle_type]}
                  </Text>
                  <Text className="text-muted text-sm">
                    {v.plate}
                    {v.brand ? ` · ${v.brand}` : ''}
                    {v.color ? ` · ${v.color}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <View className="flex-row items-center gap-3">
            <Ionicons name="shield-checkmark-outline" size={20} color="#27AE60" />
            <View>
              <Text className="text-muted text-xs">Estado</Text>
              <Text className="text-success font-medium">Cuenta activa</Text>
            </View>
          </View>
        </Card>

        <Button
          label="Cerrar sesión"
          variant="outline"
          onPress={handleSignOut}
          className="mt-4"
        />

        <Text className="text-center text-muted text-xs mt-4">
          Korre v1.0.0
        </Text>
      </View>
    </View>
  );
}
