-- ============================================================
-- AprovAI — patch: políticas RLS com função is_current_user_admin()
-- Execute no SQL Editor se já tinha a migração antiga e:
--   - o perfil está `admin` na tabela mas INSERT/UPDATE em métodos falha, ou
--   - o app mostra erros de "row-level security".
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);

  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND lower(btrim(p.role::text)) = 'admin'
  ) THEN
    RETURN true;
  END IF;
  IF to_regclass('public.users') IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND lower(btrim(u.role::text)) = 'admin'
  ) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
CREATE POLICY "profiles_update_admin_or_self"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin())
  WITH CHECK (auth.uid() = id OR public.is_current_user_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "methods_insert_admin" ON public.study_methods;
CREATE POLICY "methods_insert_admin"
  ON public.study_methods FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "methods_update_admin" ON public.study_methods;
CREATE POLICY "methods_update_admin"
  ON public.study_methods FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "methods_delete_admin" ON public.study_methods;
CREATE POLICY "methods_delete_admin"
  ON public.study_methods FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());
