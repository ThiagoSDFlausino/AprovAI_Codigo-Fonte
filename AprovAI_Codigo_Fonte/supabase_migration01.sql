-- ============================================================
-- AprovAI - Migração: alunos por matéria, atividades e progresso
-- Banco existente: Usuario, MetodoEstudo e Materia já existem.
-- Execute este arquivo no SQL Editor do Supabase.
-- Não execute novamente o supabase_migration.sql completo.
-- ============================================================

BEGIN;

-- 1) Associação N:N entre alunos e matérias.
CREATE TABLE IF NOT EXISTS public."MateriaAluno" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id UUID NOT NULL REFERENCES public."Materia"(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public."Usuario"(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "MateriaAluno_materia_aluno_unique" UNIQUE (materia_id, aluno_id)
);

CREATE INDEX IF NOT EXISTS "idx_MateriaAluno_aluno_id"
  ON public."MateriaAluno" (aluno_id);
CREATE INDEX IF NOT EXISTS "idx_MateriaAluno_materia_id"
  ON public."MateriaAluno" (materia_id);

-- 2) Atividades pertencem a uma matéria.
CREATE TABLE IF NOT EXISTS public."Atividade" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id UUID NOT NULL REFERENCES public."Materia"(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  prazo DATE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_Atividade_materia_id"
  ON public."Atividade" (materia_id);

-- 3) Um registro de progresso por aluno e por atividade.
CREATE TABLE IF NOT EXISTS public."Progresso" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public."Usuario"(id) ON DELETE CASCADE,
  atividade_id UUID NOT NULL REFERENCES public."Atividade"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NAO_INICIADO'
    CHECK (status IN ('NAO_INICIADO', 'ATIVO', 'CONCLUIDO', 'ATRASADO')),
  nota INTEGER,
  data_inicio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  percentual_conclusao DOUBLE PRECISION NOT NULL DEFAULT 0
    CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Progresso_aluno_atividade_unique" UNIQUE (aluno_id, atividade_id)
);

CREATE INDEX IF NOT EXISTS "idx_Progresso_aluno_id"
  ON public."Progresso" (aluno_id);
CREATE INDEX IF NOT EXISTS "idx_Progresso_atividade_id"
  ON public."Progresso" (atividade_id);

-- 4) Funções auxiliares para as políticas RLS.
-- SECURITY DEFINER evita recursão ao consultar tabelas protegidas por RLS.
CREATE OR REPLACE FUNCTION public.is_professor_responsavel_materia(p_materia_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."Materia" m
    WHERE m.id = p_materia_id
      AND m.criado_por = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_aluno_vinculado_materia(p_materia_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."MateriaAluno" ma
    JOIN public."Usuario" u ON u.id = ma.aluno_id
    WHERE ma.materia_id = p_materia_id
      AND ma.aluno_id = auth.uid()
      AND u.perfil = 'Aluno'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_professor_responsavel_materia(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_aluno_vinculado_materia(UUID) TO authenticated;

-- 5) Criar progresso inicial para alunos já associados quando uma atividade for criada.
CREATE OR REPLACE FUNCTION public.criar_progresso_inicial_da_atividade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Progresso" (aluno_id, atividade_id, status, percentual_conclusao)
  SELECT ma.aluno_id, NEW.id, 'NAO_INICIADO', 0
  FROM public."MateriaAluno" ma
  WHERE ma.materia_id = NEW.materia_id
  ON CONFLICT (aluno_id, atividade_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_atividade_criar_progresso" ON public."Atividade";
CREATE TRIGGER "trg_atividade_criar_progresso"
AFTER INSERT ON public."Atividade"
FOR EACH ROW EXECUTE FUNCTION public.criar_progresso_inicial_da_atividade();

-- Criar progresso inicial para atividades existentes quando um aluno for associado.
CREATE OR REPLACE FUNCTION public.criar_progresso_inicial_do_vinculo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Progresso" (aluno_id, atividade_id, status, percentual_conclusao)
  SELECT NEW.aluno_id, a.id, 'NAO_INICIADO', 0
  FROM public."Atividade" a
  WHERE a.materia_id = NEW.materia_id
  ON CONFLICT (aluno_id, atividade_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_vinculo_criar_progresso" ON public."MateriaAluno";
CREATE TRIGGER "trg_vinculo_criar_progresso"
AFTER INSERT ON public."MateriaAluno"
FOR EACH ROW EXECUTE FUNCTION public.criar_progresso_inicial_do_vinculo();

-- 6) Habilitar RLS.
ALTER TABLE public."MateriaAluno" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Atividade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Progresso" ENABLE ROW LEVEL SECURITY;

-- 7) Matéria: aluno vê somente matéria associada; professor vê a própria.
DROP POLICY IF EXISTS "Materia_select_autenticado" ON public."Materia";
DROP POLICY IF EXISTS "Materia_select_permitidos" ON public."Materia";
CREATE POLICY "Materia_select_permitidos"
ON public."Materia" FOR SELECT TO authenticated
USING (
  public.is_current_user_admin()
  OR criado_por = auth.uid()
  OR public.is_aluno_vinculado_materia(id)
);

-- Restringir alterações de matéria ao professor responsável ou administrador.
DROP POLICY IF EXISTS "Materia_update_professor" ON public."Materia";
CREATE POLICY "Materia_update_professor"
ON public."Materia" FOR UPDATE TO authenticated
USING (criado_por = auth.uid() OR public.is_current_user_admin())
WITH CHECK (criado_por = auth.uid() OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Materia_delete_professor" ON public."Materia";
CREATE POLICY "Materia_delete_professor"
ON public."Materia" FOR DELETE TO authenticated
USING (criado_por = auth.uid() OR public.is_current_user_admin());

-- 8) Associação: professor responsável administra; aluno consulta seu próprio vínculo.
DROP POLICY IF EXISTS "MateriaAluno_select" ON public."MateriaAluno";
CREATE POLICY "MateriaAluno_select"
ON public."MateriaAluno" FOR SELECT TO authenticated
USING (
  aluno_id = auth.uid()
  OR public.is_professor_responsavel_materia(materia_id)
  OR public.is_current_user_admin()
);

DROP POLICY IF EXISTS "MateriaAluno_insert" ON public."MateriaAluno";
CREATE POLICY "MateriaAluno_insert"
ON public."MateriaAluno" FOR INSERT TO authenticated
WITH CHECK (
  (public.is_professor_responsavel_materia(materia_id)
    AND EXISTS (SELECT 1 FROM public."Usuario" u WHERE u.id = aluno_id AND u.perfil = 'Aluno'))
  OR public.is_current_user_admin()
);

DROP POLICY IF EXISTS "MateriaAluno_delete" ON public."MateriaAluno";
CREATE POLICY "MateriaAluno_delete"
ON public."MateriaAluno" FOR DELETE TO authenticated
USING (public.is_professor_responsavel_materia(materia_id) OR public.is_current_user_admin());

-- 9) Atividade: aluno associado consulta; professor responsável administra.
DROP POLICY IF EXISTS "Atividade_select" ON public."Atividade";
CREATE POLICY "Atividade_select"
ON public."Atividade" FOR SELECT TO authenticated
USING (
  public.is_professor_responsavel_materia(materia_id)
  OR public.is_aluno_vinculado_materia(materia_id)
  OR public.is_current_user_admin()
);

DROP POLICY IF EXISTS "Atividade_insert" ON public."Atividade";
CREATE POLICY "Atividade_insert"
ON public."Atividade" FOR INSERT TO authenticated
WITH CHECK (public.is_professor_responsavel_materia(materia_id) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Atividade_update" ON public."Atividade";
CREATE POLICY "Atividade_update"
ON public."Atividade" FOR UPDATE TO authenticated
USING (public.is_professor_responsavel_materia(materia_id) OR public.is_current_user_admin())
WITH CHECK (public.is_professor_responsavel_materia(materia_id) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Atividade_delete" ON public."Atividade";
CREATE POLICY "Atividade_delete"
ON public."Atividade" FOR DELETE TO authenticated
USING (public.is_professor_responsavel_materia(materia_id) OR public.is_current_user_admin());

-- 10) Progresso: aluno consulta/atualiza o próprio; professor responsável consulta.
DROP POLICY IF EXISTS "Progresso_select" ON public."Progresso";
CREATE POLICY "Progresso_select"
ON public."Progresso" FOR SELECT TO authenticated
USING (
  aluno_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public."Atividade" a
    WHERE a.id = atividade_id
      AND public.is_professor_responsavel_materia(a.materia_id)
  )
  OR public.is_current_user_admin()
);

-- O progresso é criado exclusivamente pelos triggers de vínculo e atividade.
-- O aluno não pode inserir registros de progresso manualmente.
DROP POLICY IF EXISTS "Progresso_insert_aluno" ON public."Progresso";

DROP POLICY IF EXISTS "Progresso_update_aluno" ON public."Progresso";
CREATE POLICY "Progresso_update_aluno"
ON public."Progresso" FOR UPDATE TO authenticated
USING (aluno_id = auth.uid())
WITH CHECK (aluno_id = auth.uid());

-- Impede que o aluno altere nota, datas ou percentual diretamente pela API.
-- As únicas transições permitidas são: NAO_INICIADO -> ATIVO -> CONCLUIDO.
CREATE OR REPLACE FUNCTION public.validar_atualizacao_progresso()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> OLD.aluno_id THEN
    RAISE EXCEPTION 'Somente o próprio aluno pode atualizar seu progresso.';
  END IF;

  IF NEW.aluno_id <> OLD.aluno_id OR NEW.atividade_id <> OLD.atividade_id
     OR NEW.nota IS DISTINCT FROM OLD.nota
     OR NEW.criado_em IS DISTINCT FROM OLD.criado_em THEN
    RAISE EXCEPTION 'Não é permitido alterar os dados de identificação ou a nota.';
  END IF;

  IF OLD.status = 'NAO_INICIADO' AND NEW.status = 'ATIVO' THEN
    NEW.data_inicio := COALESCE(OLD.data_inicio, NOW());
    NEW.data_conclusao := NULL;
    NEW.percentual_conclusao := 50;
  ELSIF OLD.status = 'ATIVO' AND NEW.status = 'CONCLUIDO' THEN
    IF OLD.data_inicio IS NULL THEN
      RAISE EXCEPTION 'A atividade precisa ser iniciada antes da conclusão.';
    END IF;
    NEW.data_inicio := OLD.data_inicio;
    NEW.data_conclusao := NOW();
    NEW.percentual_conclusao := 100;
  ELSE
    RAISE EXCEPTION 'Transição de status inválida.';
  END IF;

  NEW.atualizado_em := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_validar_atualizacao_progresso" ON public."Progresso";
CREATE TRIGGER "trg_validar_atualizacao_progresso"
BEFORE UPDATE ON public."Progresso"
FOR EACH ROW EXECUTE FUNCTION public.validar_atualizacao_progresso();

-- A tabela Progresso não recebe política de DELETE para usuários comuns.

-- 11) Corrigir vínculos de progresso para os dados já existentes (caso haja).
INSERT INTO public."Progresso" (aluno_id, atividade_id, status, percentual_conclusao)
SELECT ma.aluno_id, a.id, 'NAO_INICIADO', 0
FROM public."MateriaAluno" ma
JOIN public."Atividade" a ON a.materia_id = ma.materia_id
ON CONFLICT (aluno_id, atividade_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;
