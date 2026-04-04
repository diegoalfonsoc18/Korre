import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { session, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#C8FF00" />
      </View>
    );
  }

  // TODO: quitar este bypass cuando auth esté listo
  return <Redirect href="/(client)/home" />;

  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (profile?.role === 'driver') {
    return <Redirect href="/(driver)/home" />;
  }

  return <Redirect href="/(client)/home" />;
}
