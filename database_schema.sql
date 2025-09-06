-- Database schema for add-ons functionality

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- e.g., 'per ton', 'per load', 'per cubic yard'
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_addons join table
CREATE TABLE IF NOT EXISTS order_addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, addon_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_addons_order_id ON order_addons(order_id);
CREATE INDEX IF NOT EXISTS idx_order_addons_addon_id ON order_addons(addon_id);
CREATE INDEX IF NOT EXISTS idx_addons_available ON addons(is_available);

-- Insert sample add-ons
INSERT INTO addons (name, description, price, unit, is_available) VALUES
('Sand', 'High-quality construction sand for various projects', 25.00, 'per ton', true),
('Gravel', 'Crushed stone gravel for drainage and construction', 30.00, 'per ton', true),
('Rocks', 'Large decorative rocks for landscaping', 45.00, 'per ton', true),
('Concrete Mix', 'Ready-mix concrete for construction projects', 80.00, 'per cubic yard', true),
('Topsoil', 'Premium topsoil for gardening and landscaping', 20.00, 'per ton', true),
('Mulch', 'Organic mulch for garden beds and landscaping', 15.00, 'per cubic yard', true);

-- Enable Row Level Security (RLS)
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for addons (public read access)
CREATE POLICY "Addons are viewable by everyone" ON addons
  FOR SELECT USING (true);

-- Create RLS policies for order_addons (users can only see their own order addons)
CREATE POLICY "Users can view their own order addons" ON order_addons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_addons.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can see all order addons
CREATE POLICY "Admins can view all order addons" ON order_addons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only authenticated users can insert order addons (through API)
CREATE POLICY "Authenticated users can insert order addons" ON order_addons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update/delete order addons
CREATE POLICY "Admins can update order addons" ON order_addons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete order addons" ON order_addons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

