
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (user_id uuid, email text, created_at timestamptz, roles app_role[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         u.email::text,
         u.created_at,
         COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}')::app_role[]
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_role(_target uuid, _role app_role, _grant boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target, _role)
    ON CONFLICT DO NOTHING;
  ELSE
    -- Prevent removing your own admin role (avoid lockout)
    IF _role = 'admin' AND _target = auth.uid() THEN
      RAISE EXCEPTION 'cannot revoke your own admin role';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _target AND role = _role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid, app_role, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) TO authenticated;
