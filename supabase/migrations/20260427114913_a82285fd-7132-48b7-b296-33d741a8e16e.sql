-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('user', 'organiser', 'admin');
CREATE TYPE public.event_category AS ENUM ('music','festivals','sports','comedy','food','conferences');
CREATE TYPE public.sa_city AS ENUM ('Cape Town','Johannesburg','Durban','Pretoria');
CREATE TYPE public.order_status AS ENUM ('pending','paid','cancelled','refunded');

-- =========================
-- UTIL: updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Now that user_roles exists, attach the signup trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- EVENTS
-- =========================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  category public.event_category NOT NULL,
  city public.sa_city NOT NULL,
  venue TEXT NOT NULL,
  venue_address TEXT,
  date TIMESTAMPTZ NOT NULL,
  doors_time TIMESTAMPTZ,
  image TEXT NOT NULL,
  hero_image TEXT,
  price_from INTEGER NOT NULL DEFAULT 0,
  organiser TEXT NOT NULL,
  organiser_verified BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_date ON public.events(date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT USING (true);
CREATE POLICY "Organisers and admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND (public.has_role(auth.uid(), 'organiser') OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Owners can update their events"
  ON public.events FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete their events"
  ON public.events FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- TICKET TIERS
-- =========================
CREATE TABLE public.ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  capacity INTEGER,
  perks TEXT[] NOT NULL DEFAULT '{}',
  badge TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ticket_tiers_event ON public.ticket_tiers(event_id);
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket tiers are viewable by everyone"
  ON public.ticket_tiers FOR SELECT USING (true);
CREATE POLICY "Event owners can manage their tiers"
  ON public.ticket_tiers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id
            AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id
            AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE TRIGGER trg_ticket_tiers_updated_at
  BEFORE UPDATE ON public.ticket_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SAVED EVENTS
-- =========================
CREATE TABLE public.saved_events (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saves"
  ON public.saved_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saves"
  ON public.saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saves"
  ON public.saved_events FOR DELETE USING (auth.uid() = user_id);

-- =========================
-- ORDERS & ORDER ITEMS
-- =========================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Event owners view orders for their events"
  ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id
            AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_tier_id UUID NOT NULL REFERENCES public.ticket_tiers(id) ON DELETE RESTRICT,
  tier_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Users create own order items"
  ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Event owners view order items for their events"
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.events e ON e.id = o.event_id
      WHERE o.id = order_id
        AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );