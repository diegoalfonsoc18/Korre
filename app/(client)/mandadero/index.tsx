import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useErrandStore } from '@/stores/errandStore';
import { ErrandCategory } from '@/types/database.types';

const CATEGORIES: { key: ErrandCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'compras', label: 'Compras', icon: 'cart-outline' },
  { key: 'documentos', label: 'Documentos', icon: 'document-text-outline' },
  { key: 'paquetes', label: 'Paquetes', icon: 'cube-outline' },
  { key: 'otro', label: 'Otro', icon: 'ellipsis-horizontal' },
];

export default function MandaderoRequestScreen() {
  const { draft, updateDraft } = useErrandStore();
  const [itemValueText, setItemValueText] = useState('');

  const canContinue = draft.category && draft.description.length >= 10;

  const handleContinue = () => {
    if (!canContinue) return;
    const numericValue = itemValueText
      ? parseFloat(itemValueText.replace(/[^0-9]/g, ''))
      : null;
    updateDraft({ estimatedItemValue: numericValue || null });
    router.push('/(client)/mandadero/locations');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="px-5 pt-14 pb-8 flex-1">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>
                Mandadero Digital
              </Text>
              <Text className="text-sm" style={{ color: '#8E8E93' }}>
                ¿Qué necesitas que hagamos por ti?
              </Text>
            </View>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#C8FF00' }}>
              <Ionicons name="walk-outline" size={20} color="#1A1A2E" />
            </View>
          </View>

          {/* Categorías */}
          <Text className="text-base font-semibold mb-3" style={{ color: '#1A1A2E' }}>
            Tipo de mandado
          </Text>
          <View className="flex-row gap-3 mb-6">
            {CATEGORIES.map((cat) => {
              const isSelected = draft.category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => updateDraft({ category: cat.key })}
                  className="flex-1 items-center py-4 rounded-xl"
                  style={{
                    backgroundColor: isSelected ? '#1A1A2E' : '#F5F5F5',
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: '#C8FF00',
                  }}
                >
                  <Ionicons
                    name={cat.icon}
                    size={24}
                    color={isSelected ? '#C8FF00' : '#8E8E93'}
                  />
                  <Text
                    className="text-xs mt-2 font-medium"
                    style={{ color: isSelected ? '#FFFFFF' : '#8E8E93' }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Descripción */}
          <Text className="text-base font-semibold mb-2" style={{ color: '#1A1A2E' }}>
            ¿Qué necesitas?
          </Text>
          <View
            className="rounded-xl p-4 mb-1"
            style={{ backgroundColor: '#F5F5F5', minHeight: 120 }}
          >
            <TextInput
              placeholder="Describe tu mandado... Ej: Comprar 2 kilos de arroz en el D1 de la Calle 80"
              placeholderTextColor="#BDBDBD"
              multiline
              numberOfLines={4}
              value={draft.description}
              onChangeText={(text) => updateDraft({ description: text })}
              style={{
                color: '#1A1A2E',
                fontSize: 15,
                lineHeight: 22,
                textAlignVertical: 'top',
              }}
            />
          </View>
          <Text className="text-xs mb-5" style={{ color: '#BDBDBD' }}>
            {draft.description.length}/200 caracteres
          </Text>

          {/* Foto opcional */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 rounded-xl mb-6"
            style={{ borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed' }}
          >
            <Ionicons name="camera-outline" size={22} color="#8E8E93" />
            <Text className="ml-2 text-sm" style={{ color: '#8E8E93' }}>
              Agregar foto (opcional)
            </Text>
          </TouchableOpacity>

          {/* Valor artículos */}
          {draft.category === 'compras' && (
            <View className="mb-6">
              <Text className="text-base font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                Valor aproximado de los artículos
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: '#F5F5F5' }}
              >
                <Text className="text-base font-semibold mr-2" style={{ color: '#1A1A2E' }}>$</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="numeric"
                  value={itemValueText}
                  onChangeText={setItemValueText}
                  style={{ flex: 1, color: '#1A1A2E', fontSize: 16 }}
                />
                <Text className="text-sm" style={{ color: '#8E8E93' }}>COP</Text>
              </View>
            </View>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Botón continuar */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canContinue}
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: canContinue ? '#C8FF00' : '#E0E0E0',
            }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: canContinue ? '#1A1A2E' : '#BDBDBD' }}
            >
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
