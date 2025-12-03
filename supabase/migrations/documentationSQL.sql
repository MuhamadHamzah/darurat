/*
  # DaruratKu Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `icon` (text)
      - `created_at` (timestamp)
    
    - `lost_items`
      - `id` (uuid, primary key) 
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `category_id` (uuid, references categories)
      - `location` (text)
      - `date_lost` (date)
      - `image_url` (text, nullable)
      - `contact_phone` (text)
      - `reward_amount` (integer, nullable)
      - `status` (text, default 'lost')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for lost items to help with searching
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  location text NOT NULL,
  date_lost date NOT NULL,
  image_url text,
  contact_phone text NOT NULL,
  reward_amount integer DEFAULT 0,
  status text DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Lost items policies
CREATE POLICY "Lost items are viewable by everyone"
  ON lost_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own lost items"
  ON lost_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost items"
  ON lost_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost items"
  ON lost_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
  ('Elektronik', 'Smartphone'),
  ('Dokumen', 'FileText'),
  ('Kendaraan', 'Car'),
  ('Tas & Dompet', 'Wallet'),
  ('Perhiasan', 'Diamond'),
  ('Kunci', 'Key'),
  ('Pakaian', 'Shirt'),
  ('Lainnya', 'Package')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lost_items_updated_at
  BEFORE UPDATE ON lost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- =============================================
-- DARURATKU DATABASE SCHEMA - ENHANCED VERSION
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES
-- =============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enhanced lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  location text NOT NULL,
  location_lat decimal(10,8),
  location_lng decimal(11,8),
  location_description text,
  date_lost date NOT NULL,
  image_url text,
  contact_phone text NOT NULL,
  reward_amount integer DEFAULT 0,
  status text DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'closed')),
  ai_verification_score decimal(3,2) DEFAULT 0.0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- CHAT & VERIFICATION SYSTEM
-- =============================================

-- Chat conversations between users
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  finder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'verified')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'verification')),
  ai_analysis jsonb,
  is_ai_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- AI verification requests
CREATE TABLE IF NOT EXISTS ai_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  finder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_data jsonb NOT NULL,
  ai_score decimal(3,2) NOT NULL,
  ai_confidence decimal(3,2) NOT NULL,
  verification_result text CHECK (verification_result IN ('verified', 'rejected', 'pending')),
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- SECURITY & TRACKING
-- =============================================

-- Report access tracking
CREATE TABLE IF NOT EXISTS report_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid REFERENCES lost_items(id) ON DELETE CASCADE NOT NULL,
  accessor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'contact', 'chat_init')),
  ip_address inet,
  user_agent text,
  location_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- User profiles (extended)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  location text,
  verification_level integer DEFAULT 0,
  trust_score decimal(3,2) DEFAULT 5.0,
  total_reports integer DEFAULT 0,
  successful_finds integer DEFAULT 0,
  is_tutorial_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions for enhanced security
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text NOT NULL,
  device_info jsonb,
  ip_address inet,
  location_data jsonb,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('new_message', 'item_found', 'verification_complete', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY POLICIES
-- =============================================

-- Categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT TO public USING (true);

-- Lost items policies
CREATE POLICY "Lost items are viewable by everyone"
  ON lost_items FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert their own lost items"
  ON lost_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost items"
  ON lost_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost items"
  ON lost_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Chat conversations policies
CREATE POLICY "Users can view their own conversations"
  ON chat_conversations FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR auth.uid() = finder_id);

CREATE POLICY "Users can create conversations"
  ON chat_conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = finder_id);

CREATE POLICY "Users can update their own conversations"
  ON chat_conversations FOR UPDATE TO authenticated
  USING (auth.uid() = reporter_id OR auth.uid() = finder_id);

-- Chat messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (reporter_id = auth.uid() OR finder_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (reporter_id = auth.uid() OR finder_id = auth.uid())
    )
  );

-- AI verifications policies
CREATE POLICY "Users can view verifications for their items"
  ON ai_verifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_items 
      WHERE id = lost_item_id 
      AND user_id = auth.uid()
    ) OR finder_id = auth.uid()
  );

CREATE POLICY "Users can create verifications"
  ON ai_verifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = finder_id);

-- Report access logs policies
CREATE POLICY "Users can view access logs for their reports"
  ON report_access_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_items 
      WHERE id = lost_item_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert access logs"
  ON report_access_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON user_profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User sessions policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions"
  ON user_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_lost_items_updated_at
  BEFORE UPDATE ON lost_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log report access
CREATE OR REPLACE FUNCTION log_report_access(
  item_id uuid,
  access_type text,
  user_ip inet DEFAULT NULL,
  user_agent_string text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO report_access_logs (
    lost_item_id,
    accessor_id,
    access_type,
    ip_address,
    user_agent
  ) VALUES (
    item_id,
    auth.uid(),
    access_type,
    user_ip,
    user_agent_string
  );
END;
$$ language plpgsql security definer;

-- Function to delete user account and all data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  user_uuid uuid := auth.uid();
BEGIN
  -- Delete all user data (cascading deletes will handle related records)
  DELETE FROM user_profiles WHERE id = user_uuid;
  DELETE FROM lost_items WHERE user_id = user_uuid;
  DELETE FROM user_sessions WHERE user_id = user_uuid;
  DELETE FROM notifications WHERE user_id = user_uuid;
  
  -- Delete the auth user (this should be done last)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$ language plpgsql security definer;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Lost items indexes
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_category_id ON lost_items(category_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at ON lost_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_location ON lost_items USING GIST(ll_to_earth(location_lat, location_lng));

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lost_item ON chat_conversations(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Access logs indexes
CREATE INDEX IF NOT EXISTS idx_access_logs_item_id ON report_access_logs(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessor ON report_access_logs(accessor_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON report_access_logs(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
  ('Elektronik', 'Smartphone'),
  ('Dokumen', 'FileText'),
  ('Kendaraan', 'Car'),
  ('Tas & Dompet', 'Wallet'),
  ('Perhiasan', 'Diamond'),
  ('Kunci', 'Key'),
  ('Pakaian', 'Shirt'),
  ('Lainnya', 'Package')
ON CONFLICT DO NOTHING;