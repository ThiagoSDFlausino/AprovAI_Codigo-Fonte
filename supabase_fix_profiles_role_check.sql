ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles SET role = 'adm' WHERE lower(btrim(role)) IN ('admin', 'adm');
UPDATE public.profiles SET role = 'aluno' WHERE lower(btrim(role)) IN ('standard', 'aluno');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('adm', 'professor', 'aluno'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'aluno';
