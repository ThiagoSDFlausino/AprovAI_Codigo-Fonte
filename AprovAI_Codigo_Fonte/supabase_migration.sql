-- ============================================================
-- AprovAI — Schema Supabase (UM único arquivo)
--
-- Instalação NOVA (banco vazio):
--   Execute o arquivo inteiro no SQL Editor do Supabase.
--
-- Banco JÁ EXISTENTE (Usuario + MetodoEstudo já criados):
--   Execute APENAS a seção "PATCH — Materia" no final deste arquivo.
--   Não recrie o banco nem rode o script completo de novo.
-- ============================================================

-- ============================================================
-- 1. TABELA "Usuario" (classe Usuario)
-- ============================================================

CREATE TABLE public."Usuario" (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  senha         TEXT,
  perfil        TEXT NOT NULL DEFAULT 'Aluno'
                  CHECK (perfil IN ('Adm', 'Aluno', 'Professor')),
  funcao        TEXT,
  formacao      TEXT,
  matricula     INTEGER,
  curso         TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA "MetodoEstudo" (classe MetodoEstudo)
-- ============================================================

CREATE TABLE public."MetodoEstudo" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  categoria     TEXT NOT NULL
                  CHECK (categoria IN ('focus', 'organization', 'revision', 'memorization', 'reading', 'practice')),
  duracao       INTEGER,
  beneficios    TEXT[] DEFAULT '{}',
  ideal_para    TEXT,
  criado_por    UUID REFERENCES public."Usuario"(id) ON DELETE SET NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABELA "Materia" (classe Materia)
-- ============================================================

CREATE TABLE public."Materia" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigla         TEXT NOT NULL UNIQUE,
  criado_por    UUID REFERENCES public."Usuario"(id) ON DELETE SET NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. FUNÇÕES AUXILIARES
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
    SELECT 1 FROM public."Usuario" u
    WHERE u.id = auth.uid()
      AND lower(btrim(u.perfil::text)) IN ('admin', 'adm')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_current_user_professor()
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);

  IF EXISTS (
    SELECT 1 FROM public."Usuario" u
    WHERE u.id = auth.uid()
      AND lower(btrim(u.perfil::text)) = 'professor'
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_professor() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  perfil_usuario TEXT;
BEGIN
  perfil_usuario := CASE lower(btrim(COALESCE(NEW.raw_user_meta_data->>'role', '')))
    WHEN 'adm' THEN 'Adm'
    WHEN 'admin' THEN 'Adm'
    WHEN 'professor' THEN 'Professor'
    WHEN 'aluno' THEN 'Aluno'
    WHEN 'standard' THEN 'Aluno'
    ELSE 'Aluno'
  END;

  INSERT INTO public."Usuario" (id, nome, email, senha, perfil)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    NULL,
    perfil_usuario
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public."Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MetodoEstudo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Materia" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario_select_autenticado"
  ON public."Usuario" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuario_insert_adm"
  ON public."Usuario" FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_current_user_admin()
    OR auth.uid() = id
  );

CREATE POLICY "Usuario_update_adm_ou_proprio"
  ON public."Usuario" FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin())
  WITH CHECK (auth.uid() = id OR public.is_current_user_admin());

CREATE POLICY "Usuario_delete_adm"
  ON public."Usuario" FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "MetodoEstudo_select_autenticado"
  ON public."MetodoEstudo" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MetodoEstudo_insert_adm"
  ON public."MetodoEstudo" FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "MetodoEstudo_update_adm"
  ON public."MetodoEstudo" FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "MetodoEstudo_delete_adm"
  ON public."MetodoEstudo" FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Materia_select_autenticado"
  ON public."Materia" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Materia_insert_professor"
  ON public."Materia" FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_professor());

CREATE POLICY "Materia_update_professor"
  ON public."Materia" FOR UPDATE
  TO authenticated
  USING (public.is_current_user_professor());

CREATE POLICY "Materia_delete_professor"
  ON public."Materia" FOR DELETE
  TO authenticated
  USING (public.is_current_user_professor());

-- ============================================================
-- 6. DADOS INICIAIS
-- ============================================================

INSERT INTO public."MetodoEstudo" (nome, descricao, categoria, duracao, beneficios, ideal_para)
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
-- PATCH — Materia (banco já existente)
-- Execute SOMENTE esta seção se "Usuario" e "MetodoEstudo"
-- já existirem. Reaproveita o mesmo projeto Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS public."Materia" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigla         TEXT NOT NULL UNIQUE,
  criado_por    UUID REFERENCES public."Usuario"(id) ON DELETE SET NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_current_user_professor()
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);

  IF EXISTS (
    SELECT 1 FROM public."Usuario" u
    WHERE u.id = auth.uid()
      AND lower(btrim(u.perfil::text)) = 'professor'
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_professor() TO authenticated;

ALTER TABLE public."Materia" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Materia_select_autenticado" ON public."Materia";
DROP POLICY IF EXISTS "Materia_insert_professor" ON public."Materia";
DROP POLICY IF EXISTS "Materia_update_professor" ON public."Materia";
DROP POLICY IF EXISTS "Materia_delete_professor" ON public."Materia";

CREATE POLICY "Materia_select_autenticado"
  ON public."Materia" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Materia_insert_professor"
  ON public."Materia" FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_professor());

CREATE POLICY "Materia_update_professor"
  ON public."Materia" FOR UPDATE
  TO authenticated
  USING (public.is_current_user_professor());

CREATE POLICY "Materia_delete_professor"
  ON public."Materia" FOR DELETE
  TO authenticated
  USING (public.is_current_user_professor());

NOTIFY pgrst, 'reload schema';
