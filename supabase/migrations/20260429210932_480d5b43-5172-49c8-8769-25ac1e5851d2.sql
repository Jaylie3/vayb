CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NULL,
  buyer_phone TEXT NULL,
  event_slug TEXT NOT NULL,
  event_title TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total INTEGER NOT NULL,
  payment_id TEXT NOT NULL UNIQUE,
  payfast_payment_id TEXT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  qr_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_buyer_email ON public.tickets(lower(buyer_email));
CREATE INDEX idx_tickets_payment_id ON public.tickets(payment_id);

CREATE POLICY "Users can view tickets for their account or email"
ON public.tickets
FOR SELECT
USING (
  auth.uid() = user_id
  OR lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can manage tickets"
ON public.tickets
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();