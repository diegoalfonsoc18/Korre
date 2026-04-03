-- ============================================================
-- pideYa - Mandadero Digital: Esquema de Base de Datos
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql
-- ============================================================

-- 1. TABLA: errands (mandados digitales)
-- ============================================================
CREATE TABLE errands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('compras', 'documentos', 'paquetes', 'otro')),
  description TEXT NOT NULL,
  photo_url TEXT,
  estimated_item_value NUMERIC(12, 2),
  pickup_address TEXT NOT NULL,
  pickup_reference TEXT,
  delivery_address TEXT NOT NULL,
  delivery_reference TEXT,
  estimated_distance_km NUMERIC(6, 2),
  base_price NUMERIC(10, 2) NOT NULL,
  distance_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'searching', 'accepted', 'at_pickup',
    'in_progress', 'in_transit', 'delivered', 'cancelled'
  )) DEFAULT 'pending',
  evidence_photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: actualizar updated_at automáticamente
CREATE TRIGGER errands_updated_at
  BEFORE UPDATE ON errands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_errands_client ON errands(client_id);
CREATE INDEX idx_errands_driver ON errands(driver_id);
CREATE INDEX idx_errands_status ON errands(status);

-- 2. RLS (Row Level Security)
-- ============================================================
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own errands"
  ON errands FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Drivers can view assigned errands"
  ON errands FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can view pending errands"
  ON errands FOR SELECT
  USING (status IN ('pending', 'searching'));

CREATE POLICY "Clients can create errands"
  ON errands FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can cancel own errands"
  ON errands FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Drivers can update assigned errands"
  ON errands FOR UPDATE
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can accept pending errands"
  ON errands FOR UPDATE
  USING (status IN ('pending', 'searching'))
  WITH CHECK (driver_id = auth.uid());

-- 3. PRICING para mandados
-- ============================================================
INSERT INTO pricing_config (vehicle_type, base_fare, price_per_km, minimum_fare)
VALUES ('mandadero', 5000, 1500, 8000)
ON CONFLICT (vehicle_type) DO NOTHING;

-- Nota: necesitamos quitar el CHECK constraint de vehicle_type en pricing_config
-- para permitir 'mandadero' como tipo. Alternativa: crear tabla separada.
-- Por ahora usamos la función de pricing en el frontend.

-- 4. HABILITAR REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE errands;
