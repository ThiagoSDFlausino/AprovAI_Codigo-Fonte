-- ============================================================
-- AprovAI — sincronizar role (e nome) de public.users → public.profiles
-- Use se promoveste admin em `public.users` mas o app/RLS ainda lê `profiles`.
-- ============================================================

UPDATE public.profiles AS p
SET
  role = CASE
    WHEN lower(btrim(u.role::text)) = 'admin' THEN 'admin'
    WHEN lower(btrim(u.role::text)) = 'standard' THEN 'standard'
    ELSE p.role
  END,
  name = COALESCE(NULLIF(trim(p.name), ''), NULLIF(trim(u.full_name), ''), p.name),
  updated_at = NOW()
FROM public.users AS u
WHERE u.id = p.id;
