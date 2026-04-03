import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

export default function ClientProfileScreen() {
  const { profile, signOut } = useAuth();
  const { reset } = useAuthStore();

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
        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-secondary font-bold text-xl">{profile?.full_name}</Text>
        <View className="flex-row items-center gap-1 mt-1">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-muted text-sm capitalize">Cliente</Text>
        </View>
      </View>

      {/* Información */}
      <View className="px-5 gap-3">
        {profile?.phone && (
          <Card>
            <View className="flex-row items-center gap-3">
              <Ionicons name="call-outline" size={20} color="#FF6B35" />
              <View>
                <Text className="text-muted text-xs">Teléfono</Text>
                <Text className="text-secondary font-medium">{profile.phone}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card>
          <View className="flex-row items-center gap-3">
            <Ionicons name="shield-checkmark-outline" size={20} color="#27AE60" />
            <View>
              <Text className="text-muted text-xs">Estado</Text>
              <Text className="text-success font-medium">Cuenta verificada</Text>
            </View>
          </View>
        </Card>

        {/* Opciones */}
        <Card className="mt-2">
          <TouchableOpacity className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center gap-3">
              <Ionicons name="notifications-outline" size={20} color="#2C3E50" />
              <Text className="text-secondary font-medium">Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>
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
