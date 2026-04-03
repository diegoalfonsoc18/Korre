import { VehicleType } from '@/types/database.types';
import { supabase } from './supabase';

const DEFAULT_PRICING = {
  moto: { base_fare: 5000, price_per_km: 1200, minimum_fare: 7000 },
  moto_carguero: { base_fare: 8000, price_per_km: 1800, minimum_fare: 12000 },
};

export async function calculatePrice(
  vehicleType: VehicleType,
  distanceKm: number
): Promise<number> {
  const { data } = await supabase
    .from('pricing_config')
    .select('*')
    .eq('vehicle_type', vehicleType)
    .eq('is_active', true)
    .single();

  const config = data ?? DEFAULT_PRICING[vehicleType];
  const calculated = config.base_fare + distanceKm * config.price_per_km;
  return Math.max(calculated, config.minimum_fare);
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Placeholder hasta tener mapas reales
export function estimateDistancePlaceholder(
  _origin: string,
  _destination: string
): number {
  // TODO: Reemplazar con Google Maps Distance Matrix API
  return 5.0;
}

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  moto: 'Moto',
  moto_carguero: 'Moto-carguero',
};

export const VEHICLE_DESCRIPTIONS: Record<VehicleType, string> = {
  moto: 'Paquetes pequeños y medianos',
  moto_carguero: 'Paquetes grandes y cargas pesadas',
};

// Mandadero Digital pricing
const ERRAND_PRICING = {
  base_fare: 5000,
  price_per_km: 1500,
  minimum_fare: 8000,
};

export function calculateErrandPrice(distanceKm: number, estimatedItemValue?: number): {
  basePrice: number;
  distancePrice: number;
  totalPrice: number;
} {
  const basePrice = ERRAND_PRICING.base_fare;
  const distancePrice = distanceKm * ERRAND_PRICING.price_per_km;
  const serviceTotal = Math.max(basePrice + distancePrice, ERRAND_PRICING.minimum_fare);
  const totalPrice = serviceTotal + (estimatedItemValue ?? 0);
  return { basePrice, distancePrice, totalPrice };
}

export const ERRAND_CATEGORY_LABELS: Record<string, string> = {
  compras: 'Compras',
  documentos: 'Documentos',
  paquetes: 'Paquetes',
  otro: 'Otro',
};

export const ERRAND_CATEGORY_ICONS: Record<string, string> = {
  compras: 'cart',
  documentos: 'document-text',
  paquetes: 'cube',
  otro: 'ellipsis-horizontal',
};

export const ERRAND_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  searching: 'Buscando mandadero',
  accepted: 'Aceptado',
  at_pickup: 'En punto de recogida',
  in_progress: 'Realizando mandado',
  in_transit: 'En camino a entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
