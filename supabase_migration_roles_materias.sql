-- ============================================================
-- AprovAI — Papéis (ADM / Professor / Aluno) + Matérias
-- Execute no SQL Editor do Supabase após supabase_migration.sql
-- ============================================================

-- Campos extras por subclasse de Usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matricula INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS curso TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS formacao TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codigo INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- IMPORTANTE: remover a constraint antiga ANTES de migrar os valores de role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Migrar papéis legados (admin/standard → adm/professor/aluno)
UPDATE public.profiles SET role = 'adm' WHERE lower(btrim(role)) IN ('admin', 'adm');
UPDATE public.profiles SET role = 'aluno' WHERE lower(btrim(role)) IN ('standard', 'aluno');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('adm', 'professor', 'aluno'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'aluno';

-- Trigger de registro com novos papéis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    CASE
      WHEN lower(NEW.raw_user_meta_data->>'role') IN ('adm', 'admin') THEN 'adm'
      WHEN lower(NEW.raw_user_meta_data->>'role') = 'professor' THEN 'professor'
      ELSE 'aluno'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helpers RLS
CREATE OR REPLACE FUNCTION public.is_current_user_adm()
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
    WHERE p.id = auth.uid() AND lower(btrim(p.role::text)) IN ('adm', 'admin')
  ) THEN
    RETURN true;
  END IF;
  IF to_regclass('public.users') IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND lower(btrim(u.role::text)) IN ('adm', 'admin')
  ) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_professor()
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND lower(btrim(p.role::text)) = 'professor'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_adm() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_professor() TO authenticated;

-- Compatibilidade: função antiga aponta para a nova
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_current_user_adm();
$$;

-- Tabela de Matérias (UC01 — Professor mantém; ADM/Aluno consultam)
CREATE TABLE IF NOT EXISTS public.materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigla TEXT NOT NULL,
  nome TEXT DEFAULT '',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.materias TO authenticated;

DROP POLICY IF EXISTS "materias_select_authenticated" ON public.materias;
DROP POLICY IF EXISTS "materias_insert_professor" ON public.materias;
DROP POLICY IF EXISTS "materias_update_professor" ON public.materias;
DROP POLICY IF EXISTS "materias_delete_professor" ON public.materias;

CREATE POLICY "materias_select_authenticated"
  ON public.materias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "materias_insert_professor"
  ON public.materias FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_professor());

CREATE POLICY "materias_update_professor"
  ON public.materias FOR UPDATE
  TO authenticated
  USING (public.is_current_user_professor());

CREATE POLICY "materias_delete_professor"
  ON public.materias FOR DELETE
  TO authenticated
  USING (public.is_current_user_professor());

-- Atualizar políticas de métodos de estudo para ADM
DROP POLICY IF EXISTS "methods_insert_admin" ON public.study_methods;
DROP POLICY IF EXISTS "methods_update_admin" ON public.study_methods;
DROP POLICY IF EXISTS "methods_delete_admin" ON public.study_methods;

CREATE POLICY "methods_insert_adm"
  ON public.study_methods FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_adm());

CREATE POLICY "methods_update_adm"
  ON public.study_methods FOR UPDATE
  TO authenticated
  USING (public.is_current_user_adm());

CREATE POLICY "methods_delete_adm"
  ON public.study_methods FOR DELETE
  TO authenticated
  USING (public.is_current_user_adm());

-- Atualizar políticas de profiles para ADM
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

CREATE POLICY "profiles_insert_adm"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_adm() OR auth.uid() = id);

CREATE POLICY "profiles_update_adm_or_self"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_current_user_adm())
  WITH CHECK (auth.uid() = id OR public.is_current_user_adm());

CREATE POLICY "profiles_delete_adm"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_current_user_adm());

-- Promover primeiro admin:
-- UPDATE public.profiles SET role = 'adm' WHERE email = 'seu@email.com';
