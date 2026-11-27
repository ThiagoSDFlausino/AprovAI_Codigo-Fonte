1. Fluxo de gerenciamento de usuários pelo administrador

1.1 Entrada na página

Arquivo: frontend/src/ManterUsuario/Pagina/ManterUsuarios.tsx

Quando a página é montada:
1. Obtém isAdmin e profile do AuthContext.
2. Inicializa a lista users, o estado loading, o campo de busca e os estados dos modais.
3. Executa UsuarioController.PesquisaUsuario.
4. Exibe os usuários retornados.
5. Permite filtrar por nome ou e-mail.

Ações administrativas:
- Novo usuário;
- Editar usuário;
- Excluir usuário.

O botão de criação e as ações de edição/exclusão só são exibidos quando isAdmin é verdadeiro. A exclusão do próprio usuário também fica desabilitada na interface.

1.2 Consulta de usuários

ManterUsuarios.tsx
  |
  v
UsuarioController.PesquisaUsuario()
  |
  v
UsuarioService.PesquisaUsuario()
  |
  v
UsuarioRepository.PesquisaUsuario()
  |
  v
UsuarioDAO.PesquisaUsuario()
  |
  v
Supabase: from("Usuario").select("*")
          .order("criado_em", ascending: false)
  |
  v
Lista de usuários na página

Responsabilidades:
- Página: inicia a consulta e atualiza a interface.
- Controller: liga o resultado ao estado users, controla loading e apresenta erros.
- Service: encaminha a operação.
- Repository: encaminha ao DAO.
- DAO: executa a consulta na tabela Usuario.

Se a consulta falhar, o Controller utiliza getSupabaseErrorMessage e, se não houver mensagem aproveitável, apresenta Erro ao carregar usuários..

1.3 Cadastro administrativo

Ao clicar em Novo Usuário, a página abre ManterUsuarioModal.tsx.

O modal solicita:
- Nome completo;
- E-mail;
- Senha;
- Perfil;
- Campo específico do perfil.
Campos específicos:
Perfil	Campo exibido
Administrador (Adm)	Função
Professor	Formação
Aluno	Matrícula e curso


Ao enviar:
ManterUsuarioModal.tsx
  |
  v
ManterUsuarios.handleSave()
  |
  v
UsuarioController.CadastroUsuario()
  |
  v
UsuarioService.CadastroUsuario()
  |-- normaliza o perfil
  |-- cria cliente Supabase sem persistência de sessão
  |-- cria conta no Supabase Auth
  |-- monta os dados do perfil
  |-- verifica se o registro já existe
  |
  v
UsuarioRepository
  |
  v
UsuarioDAO
  |
  v
public."Usuario"

Detalhamento do Service:
1. Recebe EntradaFormularioUsuario.
2. Normaliza o perfil com normalizarPerfil.
3. Cria um cliente isolado por createHeadlessSupabaseClient(). Esse cliente usa as mesmas credenciais Supabase, mas está configurado com persistSession: false, autoRefreshToken: false e detectSessionInUrl: false.
4. Executa auth.signUp com e-mail, senha e metadados name e role.
5. Se houver erro, lança o erro.
6. Se não houver authData.user.id, lança Não foi possível criar o utilizador na autenticação.
7. Monta o registro com o UUID do Auth, nome, e-mail, perfil, campos específicos e data de criação.
8. Consulta PesquisaUsuarioPorIdOpcional.
9. Se já existir registro, atualiza-o; caso contrário, cadastra-o.
O trigger on_auth_user_created também pode criar o registro na tabela Usuario durante a criação da conta. Por isso, o Service verifica se o registro já existe antes de tentar inserir, evitando duplicação.

Após sucesso, o Controller adiciona o usuário ao início da lista, apresenta Usuário criado com sucesso! e fecha o modal.

1.4 Edição de usuário
Ao clicar no ícone de edição:
1. ManterUsuarios.tsx abre o modal com o usuário selecionado.
2. ManterUsuarioModal.tsx preenche os campos com os dados existentes.
3. O e-mail fica desabilitado durante a edição.
4. A senha não é exibida nem solicitada.
5. O envio aciona UsuarioController.AtualizarUsuario.

Caminho:
ManterUsuarios.tsx
  -> ManterUsuarioModal.tsx
  -> UsuarioController.AtualizarUsuario()
  -> UsuarioService.AtualizarUsuario()
  -> UsuarioRepository.AtualizarUsuario()
  -> UsuarioDAO.AtualizarUsuario()
  -> public."Usuario"

No Service:
- Atualiza nome e e-mail somente se os campos forem fornecidos;
- Usa o perfil informado ou consulta o perfil atual;
- Normaliza o perfil;
- Aplica somente os campos correspondentes ao novo perfil.

No DAO:
- Remove senha do objeto enviado;
- Atualiza os dados na tabela Usuario;
- Atualiza atualizado_em;
- Retorna o registro atualizado.
O Controller substitui o usuário correspondente na lista, mostra Usuário atualizado! e fecha o modal.

1.5 Exclusão de usuário

Ao clicar no ícone de exclusão:
1. A página guarda o usuário selecionado em deleteConfirm.
2. Apresenta uma janela de confirmação.
3. Ao confirmar, executa UsuarioController.DeletarUsuario.
4. O Controller chama o Service.
5. O Service chama Repository.
6. O Repository chama DAO.
7. O DAO executa delete().eq('id', id) na tabela Usuario.
8. Se não houver erro, a página remove o usuário da lista e apresenta Usuário removido..

Caminho:
ManterUsuarios.tsx
  -> confirmação de exclusão
  -> UsuarioController.DeletarUsuario()
  -> UsuarioService.DeletarUsuario()
  -> UsuarioRepository.DeletarUsuario()
  -> UsuarioDAO.DeletarUsuario()
  -> DELETE em public."Usuario"


2 ROTEIRO DE TESTE

Arquivo: AuthController.tsx

Antes de chamar o Service, o Controller verifica:
| Campo/regra           |                               Condição                                |                   Mensagem                |

| Nome                  | Não pode estar vazio e deve ter pelo menos 2 caracteres após `trim()` | `Nome deve ter ao menos 2 caracteres.`    |
| Confirmação           | Senha e confirmação devem ser iguais                                  | `As senhas não coincidem.`                |
| Senha                 | Deve ter pelo menos 6 caracteres                                      | `A senha deve ter ao menos 6 caracteres.` |
| E-mail já cadastrado  | Supabase informa `User already registered`                            | `Este email já está cadastrado.`          |