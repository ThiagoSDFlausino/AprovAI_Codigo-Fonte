-- Execute no SQL Editor se o aluno não conseguir listar matérias
GRANT SELECT ON public.materias TO authenticated;

DROP POLICY IF EXISTS "materias_select_authenticated" ON public.materias;
CREATE POLICY "materias_select_authenticated"
  ON public.materias FOR SELECT
  TO authenticated
  USING (true);
