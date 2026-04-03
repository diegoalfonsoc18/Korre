export type VehicleType = 'moto' | 'moto_carguero';
export type UserRole = 'client' | 'driver';
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type ErrandCategory = 'compras' | 'documentos' | 'paquetes' | 'otro';
export type ErrandStatus =
  | 'pending'
  | 'searching'
  | 'accepted'
  | 'at_pickup'
  | 'in_progress'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type: VehicleType;
  plate: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DriverStatus {
  driver_id: string;
  is_available: boolean;
  vehicle_type: VehicleType | null;
  last_seen: string;
  updated_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  driver_id: string | null;
  origin_address: string;
  origin_reference: string | null;
  destination_address: string;
  destination_reference: string | null;
  vehicle_type: VehicleType;
  package_description: string | null;
  status: OrderStatus;
  estimated_distance_km: number | null;
  base_price: number;
  total_price: number;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  updated_at: string;
  // Joins opcionales
  client?: Pick<Profile, 'full_name' | 'phone'>;
  driver?: Pick<Profile, 'full_name' | 'phone'>;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface PricingConfig {
  id: string;
  vehicle_type: VehicleType;
  base_fare: number;
  price_per_km: number;
  minimum_fare: number;
  is_active: boolean;
}

export interface Errand {
  id: string;
  client_id: string;
  driver_id: string | null;
  category: ErrandCategory;
  description: string;
  photo_url: string | null;
  estimated_item_value: number | null;
  pickup_address: string;
  pickup_reference: string | null;
  delivery_address: string;
  delivery_reference: string | null;
  estimated_distance_km: number | null;
  base_price: number;
  distance_price: number;
  total_price: number;
  status: ErrandStatus;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  updated_at: string;
  evidence_photos: string[] | null;
  client?: Pick<Profile, 'full_name' | 'phone'>;
  driver?: Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>;
}
