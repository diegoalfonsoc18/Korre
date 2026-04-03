import { supabase } from '@/lib/supabase';
import { Errand, ErrandStatus } from '@/types/database.types';

interface CreateErrandPayload {
  clientId: string;
  category: string;
  description: string;
  photoUrl?: string;
  estimatedItemValue?: number;
  pickupAddress: string;
  pickupReference?: string;
  deliveryAddress: string;
  deliveryReference?: string;
  estimatedDistanceKm: number;
  basePrice: number;
  distancePrice: number;
  totalPrice: number;
}

export const errandService = {
  async createErrand(payload: CreateErrandPayload): Promise<Errand> {
    const { data, error } = await supabase
      .from('errands')
      .insert({
        client_id: payload.clientId,
        category: payload.category,
        description: payload.description,
        photo_url: payload.photoUrl ?? null,
        estimated_item_value: payload.estimatedItemValue ?? null,
        pickup_address: payload.pickupAddress,
        pickup_reference: payload.pickupReference ?? null,
        delivery_address: payload.deliveryAddress,
        delivery_reference: payload.deliveryReference ?? null,
        estimated_distance_km: payload.estimatedDistanceKm,
        base_price: payload.basePrice,
        distance_price: payload.distancePrice,
        total_price: payload.totalPrice,
        status: 'searching',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getClientErrands(clientId: string): Promise<Errand[]> {
    const { data, error } = await supabase
      .from('errands')
      .select('*, driver:driver_id(full_name, phone, avatar_url)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getPendingErrands(): Promise<Errand[]> {
    const { data, error } = await supabase
      .from('errands')
      .select('*, client:client_id(full_name, phone)')
      .in('status', ['pending', 'searching'])
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async acceptErrand(errandId: string, driverId: string): Promise<Errand> {
    const { data, error } = await supabase
      .from('errands')
      .update({
        driver_id: driverId,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', errandId)
      .in('status', ['pending', 'searching'])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateErrandStatus(errandId: string, status: ErrandStatus): Promise<Errand> {
    const updates: Record<string, unknown> = { status };
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('errands')
      .update(updates)
      .eq('id', errandId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addEvidencePhoto(errandId: string, photoUrl: string): Promise<Errand> {
    const { data: current } = await supabase
      .from('errands')
      .select('evidence_photos')
      .eq('id', errandId)
      .single();

    const photos = [...(current?.evidence_photos ?? []), photoUrl];

    const { data, error } = await supabase
      .from('errands')
      .update({ evidence_photos: photos })
      .eq('id', errandId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getErrandById(errandId: string): Promise<Errand> {
    const { data, error } = await supabase
      .from('errands')
      .select('*, client:client_id(full_name, phone), driver:driver_id(full_name, phone, avatar_url)')
      .eq('id', errandId)
      .single();
    if (error) throw error;
    return data;
  },

  async cancelErrand(errandId: string): Promise<void> {
    const { error } = await supabase
      .from('errands')
      .update({ status: 'cancelled' })
      .eq('id', errandId)
      .in('status', ['pending', 'searching', 'accepted']);
    if (error) throw error;
  },
};
