DROP POLICY IF EXISTS "Users can view tickets for their account or email" ON public.tickets;

CREATE POLICY "Users can view paid tickets for their account or email"
ON public.tickets
FOR SELECT
USING (
  status = 'paid'::public.order_status
  AND (
    auth.uid() = user_id
    OR lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);