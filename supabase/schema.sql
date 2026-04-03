-- ============================================================
-- Korre - Esquema de Base de Datos Supabase
-- Ejecutar en el SQL Editor de Supabase en este orden
-- ============================================================

-- 1. TABLA: profiles (extiende auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'driver')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS para profiles (política cross-table se agrega al final, después de crear orders)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- 2. TABLA: vehicles
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('moto', 'moto_carguero')),
  plate TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, plate)
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their own vehicles"
  ON vehicles FOR ALL
  USING (auth.uid() = driver_id);

CREATE POLICY "Anyone authenticated can view active vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (is_active = TRUE);


-- 3. TABLA: driver_status
-- ============================================================
CREATE TABLE driver_status (
  driver_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT FALSE,
  vehicle_type TEXT CHECK (vehicle_type IN ('moto', 'moto_carguero')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers manage their own status"
  ON driver_status FOR ALL
  USING (auth.uid() = driver_id);

CREATE POLICY "Authenticated users can view available drivers"
  ON driver_status FOR SELECT
  TO authenticated
  USING (is_available = TRUE);


-- 4. TABLA: orders
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'pending',
  'accepted',
  'in_transit',
  'delivered',
  'cancelled'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Origen
  origin_address TEXT NOT NULL,
  origin_reference TEXT,

  -- Destino
  destination_address TEXT NOT NULL,
  destination_reference TEXT,

  -- Pedido
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('moto', 'moto_carguero')),
  package_description TEXT,
  status order_status NOT NULL DEFAULT 'pending',

  -- Precio en pesos colombianos (COP)
  estimated_distance_km NUMERIC(8, 2),
  base_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,

  -- Tiempos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Order participants can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = driver_id);

CREATE POLICY "Authenticated drivers can view pending orders"
  ON orders FOR SELECT
  TO authenticated
  USING (status = 'pending');

CREATE POLICY "Clients can cancel their pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = client_id AND status IN ('pending', 'accepted'));

CREATE POLICY "Drivers can accept pending orders"
  ON orders FOR UPDATE
  USING (status = 'pending' AND auth.uid() != client_id);

CREATE POLICY "Drivers can update their accepted orders"
  ON orders FOR UPDATE
  USING (auth.uid() = driver_id AND status IN ('accepted', 'in_transit'));


-- 5. TABLA: order_status_history
-- ============================================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.client_id = auth.uid() OR orders.driver_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can insert history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- Trigger: auditoría automática al cambiar estado de orden
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER order_status_changed
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();


-- 6. TABLA: pricing_config (tarifas editables sin redeploy)
-- ============================================================
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('moto', 'moto_carguero')),
  base_fare NUMERIC(10, 2) NOT NULL,
  price_per_km NUMERIC(10, 2) NOT NULL,
  minimum_fare NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_type)
);

-- Tarifas iniciales (en COP)
-- Moto: $5.000 base + $1.200/km, mínimo $7.000
-- Moto-carguero: $8.000 base + $1.800/km, mínimo $12.000
INSERT INTO pricing_config (vehicle_type, base_fare, price_per_km, minimum_fare) VALUES
  ('moto', 5000, 1200, 7000),
  ('moto_carguero', 8000, 1800, 12000);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing"
  ON pricing_config FOR SELECT
  USING (is_active = TRUE);


-- 7. HABILITAR REALTIME
-- ============================================================
-- En Supabase Dashboard: Database > Replication > Supabase Realtime
-- Marcar las tablas: orders, driver_status, order_status_history
-- O via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_status;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;


-- 8. POLÍTICA CROSS-TABLE para profiles (requiere que orders ya exista)
-- ============================================================
CREATE POLICY "Drivers can view client profiles of their orders"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE (orders.client_id = profiles.id OR orders.driver_id = profiles.id)
      AND (orders.client_id = auth.uid() OR orders.driver_id = auth.uid())
    )
  );
