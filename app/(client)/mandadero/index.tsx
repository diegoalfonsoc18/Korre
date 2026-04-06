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
import { useErrandStore } from '@/stores/errandStore';
import { useTheme } from '@/context/ThemeContext';
import { ErrandCategory } from '@/types/database.types';

const CATEGORIES: { key: ErrandCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'compras', label: 'Compras', icon: 'cart-outline' },
  { key: 'documentos', label: 'Documentos', icon: 'document-text-outline' },
  { key: 'paquetes', label: 'Paquetes', icon: 'cube-outline' },
  { key: 'otro', label: 'Otro', icon: 'ellipsis-horizontal' },
];

export default function MandaderoRequestScreen() {
  const { draft, updateDraft } = useErrandStore();
  const { colors } = useTheme();
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
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32, flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textOnSurface} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textOnSurface }}>
                Mandadero Digital
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                ¿Que necesitas que hagamos por ti?
              </Text>
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="walk-outline" size={20} color={colors.textOnPrimary} />
            </View>
          </View>

          {/* Categorías */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnSurface, marginBottom: 12 }}>
            Tipo de mandado
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = draft.category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => updateDraft({ category: cat.key })}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderRadius: 16,
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Ionicons
                    name={cat.icon}
                    size={24}
                    color={isSelected ? colors.textOnPrimary : colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      marginTop: 6,
                      color: isSelected ? colors.textOnPrimary : colors.textOnSurface,
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Descripción */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnSurface, marginBottom: 10 }}>
            ¿Que necesitas?
          </Text>
          <View
            style={{
              borderRadius: 16,
              padding: 14,
              marginBottom: 6,
              backgroundColor: colors.surfaceVariant,
              minHeight: 120,
            }}
          >
            <TextInput
              placeholder="Describe tu mandado... Ej: Comprar 2 kilos de arroz en el D1 de la Calle 80"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={draft.description}
              onChangeText={(text) => updateDraft({ description: text })}
              style={{
                color: colors.textOnSurface,
                fontSize: 15,
                lineHeight: 22,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 20 }}>
            {draft.description.length}/200 caracteres
          </Text>

          {/* Foto opcional */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: colors.primary + '26',
              borderStyle: 'dashed',
              marginBottom: 24,
            }}
          >
            <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
            <Text style={{ marginLeft: 8, fontSize: 14, color: colors.textMuted }}>
              Agregar foto (opcional)
            </Text>
          </TouchableOpacity>

          {/* Valor artículos */}
          {draft.category === 'compras' && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnSurface, marginBottom: 10 }}>
                Valor aproximado de los artículos
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: colors.surfaceVariant,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', marginRight: 8, color: colors.textOnSurface }}>
                  $
                </Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={itemValueText}
                  onChangeText={setItemValueText}
                  style={{
                    flex: 1,
                    color: colors.textOnSurface,
                    fontSize: 16,
                  }}
                />
                <Text style={{ fontSize: 13, color: colors.textMuted }}>COP</Text>
              </View>
            </View>
          )}

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Botón continuar */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canContinue}
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: canContinue ? colors.primary : colors.primary + '33',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: canContinue ? colors.textOnPrimary : colors.textMuted,
              }}
            >
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
