import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function ScreenWrapper({
  children,
  scrollable = false,
  className = "",
}: ScreenWrapperProps) {
  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className={`flex-1 ${className}`}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`}>
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
