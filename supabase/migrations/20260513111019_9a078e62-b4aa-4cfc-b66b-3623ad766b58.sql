CREATE OR REPLACE FUNCTION public.admin_city_analytics()
RETURNS TABLE (
  city public.sa_city,
  bookings bigint,
  tickets_sold bigint,
  revenue bigint,
  commission bigint,
  payout bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    e.city,
    COUNT(DISTINCT o.id)::bigint AS bookings,
    COALESCE(SUM(oi.quantity), 0)::bigint AS tickets_sold,
    COALESCE(SUM(o.subtotal), 0)::bigint AS revenue,
    FLOOR(COALESCE(SUM(o.subtotal), 0) * 0.03)::bigint AS commission,
    (COALESCE(SUM(o.subtotal), 0) - FLOOR(COALESCE(SUM(o.subtotal), 0) * 0.03))::bigint AS payout
  FROM public.events e
  LEFT JOIN public.orders o ON o.event_id = e.id AND o.status = 'paid'
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  GROUP BY e.city
  ORDER BY revenue DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_city_analytics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_city_analytics() TO authenticated;
