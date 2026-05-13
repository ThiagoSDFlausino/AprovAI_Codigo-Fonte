-- ============================================================
-- AprovAI - Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'standard' CHECK (role IN ('admin', 'standard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on auth signup (optional trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    CASE
      WHEN (NEW.raw_user_meta_data->>'role') IN ('admin', 'standard') THEN (NEW.raw_user_meta_data->>'role')
      ELSE 'standard'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Se `profiles` não for preenchido ao registar: confirme o trigger em
-- Database → Triggers em `auth.users`, ou rode de novo o bloco da função/trigger acima.

-- ============================================================
-- 2. STUDY METHODS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('focus', 'organization', 'revision', 'memorization', 'reading', 'practice')),
  duration_minutes INTEGER,
  benefits TEXT[] DEFAULT '{}',
  ideal_for TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. HELPER — deteção de admin (SECURITY DEFINER + search_path seguro)
-- Evita falhas em políticas RLS quando o sub-SELECT em `profiles` interage mal com o contexto.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Garante leitura de profiles/users no contexto RLS (ex.: políticas em INSERT).
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

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "methods_select_authenticated" ON public.study_methods;
DROP POLICY IF EXISTS "methods_insert_admin" ON public.study_methods;
DROP POLICY IF EXISTS "methods_update_admin" ON public.study_methods;
DROP POLICY IF EXISTS "methods_delete_admin" ON public.study_methods;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_current_user_admin()
    OR auth.uid() = id
  );

CREATE POLICY "profiles_update_admin_or_self"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin())
  WITH CHECK (auth.uid() = id OR public.is_current_user_admin());

CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "methods_select_authenticated"
  ON public.study_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "methods_insert_admin"
  ON public.study_methods FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "methods_update_admin"
  ON public.study_methods FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "methods_delete_admin"
  ON public.study_methods FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

-- ============================================================
-- 5. SEED DATA (Sample study methods)
-- ============================================================

-- NOTE: Replace 'YOUR_ADMIN_USER_ID' with your actual admin UUID
-- or leave created_by as NULL for anonymous seeding

INSERT INTO public.study_methods (name, description, category, duration_minutes, benefits, ideal_for)
VALUES
  (
    'Técnica Pomodoro',
    'Divide o tempo de estudo em blocos de 25 minutos com intervalos de 5 minutos. Após 4 blocos, faça uma pausa maior de 15-30 minutos.',
    'focus',
    25,
    ARRAY['Aumenta foco', 'Reduz procrastinação', 'Melhora produtividade'],
    'Estudantes com dificuldade de concentração prolongada'
  ),
  (
    'Mapas Mentais',
    'Organiza informações de forma visual usando diagramas hierárquicos com cores, imagens e palavras-chave conectadas.',
    'organization',
    45,
    ARRAY['Facilita memorização', 'Estimula criatividade', 'Organiza ideias'],
    'Estudantes visuais e tópicos complexos'
  ),
  (
    'Repetição Espaçada',
    'Revisa o conteúdo em intervalos crescentes para transferir informações da memória de curto para longo prazo.',
    'revision',
    30,
    ARRAY['Memorização duradoura', 'Retenção eficiente', 'Combate esquecimento'],
    'Preparação para provas e concursos'
  );

-- ============================================================
-- 6. HOW TO CREATE YOUR FIRST ADMIN
-- ============================================================

-- After registering via the app, run this to promote your user to admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'seu@email.com';

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
