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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
              <Ionicons name="arrow-back" size={26} color={colors.textOnSurface} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textOnSurface, letterSpacing: -0.5 }}>
                Mandadero Digital
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, fontWeight: '600' }}>
                ¿Qué necesitas que hagamos?
              </Text>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="walk-outline" size={24} color={colors.textOnPrimary} />
            </View>
          </View>

          {/* Categorías */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, marginBottom: 14 }}>
              Tipo de mandado
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const isSelected = draft.category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => updateDraft({ category: cat.key })}
                    style={{
                      flex: 1,
                      minWidth: '48%',
                      alignItems: 'center',
                      paddingVertical: 20,
                      borderRadius: 18,
                      backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      borderWidth: isSelected ? 0 : 0,
                    }}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={28}
                      color={isSelected ? colors.textOnPrimary : "#C8FF00"}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        marginTop: 8,
                        color: isSelected ? colors.textOnPrimary : colors.textOnSurface,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Descripción */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, marginBottom: 12 }}>
              Descripción del mandado
            </Text>
            <View
              style={{
                borderRadius: 18,
                padding: 18,
                backgroundColor: colors.surfaceVariant,
                minHeight: 140,
              }}
            >
              <TextInput
                placeholder="Describe con detalle tu mandado..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={5}
                value={draft.description}
                onChangeText={(text) => updateDraft({ description: text })}
                style={{
                  color: colors.textOnSurface,
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: '500',
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, fontWeight: '600' }}>
              {draft.description.length}/200 caracteres
            </Text>
          </View>

          {/* Foto opcional */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: `${colors.primary}30`,
              borderStyle: 'dashed',
              marginBottom: 28,
            }}
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={{ marginLeft: 10, fontSize: 15, color: colors.textMuted, fontWeight: '600' }}>
              Agregar foto (opcional)
            </Text>
          </TouchableOpacity>

          {/* Valor artículos */}
          {draft.category === 'compras' && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textOnSurface, marginBottom: 12 }}>
                Valor aproximado
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 18,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  backgroundColor: colors.surfaceVariant,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', marginRight: 10, color: colors.textOnSurface }}>
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
                    fontSize: 18,
                    fontWeight: '700',
                  }}
                />
                <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '700' }}>COP</Text>
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
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              backgroundColor: canContinue ? colors.primary : `${colors.primary}30`,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
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
