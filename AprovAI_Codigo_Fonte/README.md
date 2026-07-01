# AprovAI - Métodos de Estudo

Uma aplicação web moderna para gerenciamento de métodos de estudo, matérias e usuários, construída com React, TypeScript e Supabase.

## 📋 Requisitos

### Requisitos de Sistema
- **Node.js**: v16.0.0 ou superior
- **npm**: v7.0.0 ou superior (ou yarn v1.22.0+)
- **Git**: v2.0.0 ou superior

### Requisitos de Serviços
- **Supabase**: Conta ativa com projeto configurado
- **Navegador moderno**: Chrome, Firefox, Safari, Edge (versões recentes)

### Requisitos de Conhecimento
- JavaScript/TypeScript básico
- Familiaridade com React
- Conceitos básicos de SQL e autenticação

## 📁 Estrutura das Pastas

```
AprovAI_Codigo_Fonte/
│
├── frontend/                           # Aplicação React principal
│   ├── public/
│   │   ├── index.html                 # HTML base (app shell)
│   │   └── favicon.ico               # Ícone do site
│   │
│   ├── src/
│   │   ├── Auth/                      # Módulo de autenticação
│   │   │   ├── contexts/              # Contextos React (AuthContext)
│   │   │   └── pages/                 # Páginas de autenticação
│   │   │       ├── PaginaLogin.tsx
│   │   │       ├── PaginaRegistro.tsx
│   │   │       └── PaginaPainel.tsx
│   │   │
│   │   ├── ManterUsuario/             # Gerenciamento de usuários
│   │   │   └── Pagina/
│   │   │       └── ManterUsuarios.tsx
│   │   │
│   │   ├── ManterMetodoEstudo/        # Gerenciamento de métodos de estudo
│   │   │   └── Pagina/
│   │   │       └── ManterMetodoEstudoPagina.tsx
│   │   │
│   │   ├── ManterMateria/             # Gerenciamento de matérias
│   │   │   └── Pagina/
│   │   │       └── ManterMateriaPagina.tsx
│   │   │
│   │   ├── classes/                   # Classes e modelos de dados
│   │   │   └── [modelos TypeScript]
│   │   │
│   │   ├── components/                # Componentes reutilizáveis
│   │   │   ├── shared/
│   │   │   │   └── ProtectedRoute.tsx # Wrapper para rotas protegidas
│   │   │   └── [outros componentes]
│   │   │
│   │   ├── styles/
│   │   │   └── global.css            # Estilos globais
│   │   │
│   │   ├── utils/                     # Funções utilitárias
│   │   │
│   │   ├── App.tsx                   # Componente principal com rotas
│   │   ├── index.tsx                 # Ponto de entrada React
│   │   └── react-app-env.d.ts        # Tipos TypeScript
│   │
│   ├── package.json                  # Dependências do frontend
│   ├── package-lock.json             # Lock file das dependências
│   ├── tsconfig.json                 # Configuração TypeScript
│   ├── .env.example                  # Template de variáveis de ambiente
│   └── .env                          # Variáveis de ambiente (git-ignored)
│
├── supabase_migration.sql             # Script de banco de dados Supabase
├── README.md                          # Este arquivo
└── [outros arquivos de configuração]
```

### Descrição dos Diretórios

| Diretório | Descrição |
|-----------|-----------|
| `frontend/public` | Arquivos estáticos servidos pelo servidor (HTML, ícones) |
| `frontend/src` | Código-fonte TypeScript/React da aplicação |
| `frontend/src/Auth` | Lógica de autenticação e componentes relacionados |
| `frontend/src/Manter*` | Módulos CRUD para diferentes entidades |
| `frontend/src/classes` | Definições de tipos e classes TypeScript |
| `frontend/src/components` | Componentes React reutilizáveis |
| `frontend/src/styles` | CSS global e temas |
| `frontend/src/utils` | Funções auxiliares e hooks |

## 🚀 Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/ThiagoSDFlausino/AprovAI_Codigo-Fonte.git
cd AprovAI_Codigo-Fonte
```

### 2. Instalar Dependências
```bash
cd AprovAI_Codigo_Fonte/frontend
npm install
```

Ou com Yarn:
```bash
yarn install
```

### 3. Verificar Instalação
```bash
npm --version
node --version
```

## ⚙️ Configuração

### 1. Configurar Supabase

#### 1.1 Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New project"
4. Preencha os dados do projeto

#### 1.2 Executar Migrations
1. Abra o SQL Editor no dashboard Supabase
2. Copie o conteúdo de `supabase_migration.sql`
3. Cole no SQL Editor
4. Clique em "Run"

#### 1.3 Configurar Autenticação sem Link de Confirmação (Opcional)
Se quiser permitir login apenas com email e senha (sem link de confirmação):

1. Dashboard → **Authentication** → **Providers** → **Email**
2. Desabilite **"Confirm email"**
3. Clique em **Save**

Para usuários já criados:
- Dashboard → **Authentication** → **Users**
- Clique no menu do usuário e confirme o email manualmente

Ou execute no SQL Editor:
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'user@example.com';
```

### 2. Configurar Variáveis de Ambiente

#### 2.1 Criar arquivo `.env`
```bash
cd frontend
cp .env.example .env
```

#### 2.2 Preencher Credenciais Supabase
Edite `frontend/.env`:

```dotenv
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Onde encontrar:**
- Dashboard Supabase → **Settings** → **API**
- `Project URL` = `REACT_APP_SUPABASE_URL`
- `anon` key = `REACT_APP_SUPABASE_ANON_KEY`

⚠️ **Segurança:** Nunca commit o arquivo `.env` (está em `.gitignore`)

## 🏃 Primeira Execução

### 1. Iniciar o Servidor de Desenvolvimento
```bash
cd frontend
npm start
```

Ou com Yarn:
```bash
yarn start
```

### 2. Acessar a Aplicação
O navegador abrirá automaticamente:
```
http://localhost:3000
```

Se não abrir, visite manualmente.

### 3. Fluxo de Primeiro Acesso

#### Opção A: Criar Conta Nova
1. Clique em **"Criar conta"**
2. Preencha email e senha
3. Clique em **"Registrar"**
4. Será redirecionado para o **Dashboard**

#### Opção B: Usar Conta de Teste (se existir)
1. Email: `usuario@example.com`
2. Senha: `senha123`

### 4. Navegação
- **Dashboard** (`/dashboard`): Página inicial após login
- **Usuários** (`/users`): Gerenciamento de usuários (admin)
- **Métodos** (`/methods`): Gerenciamento de métodos de estudo
- **Matérias** (`/subjects`): Gerenciamento de matérias

### 5. Parar o Servidor
```bash
Ctrl + C (Windows/Linux/Mac)
```

## 🔨 Build para Vercel

### 1. Preparação Inicial

#### 1.1 Configurar Repositório Git (se necessário)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

#### 1.2 Verificar `package.json` do Frontend
Certifique-se que possui:
```json
{
  "scripts": {
    "dev": "react-scripts start",
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### 2. Configurar Vercel

#### 2.1 Criar Conta Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Autorize Vercel

#### 2.2 Importar Projeto
1. Clique em **"New Project"**
2. Selecione seu repositório GitHub
3. Clique em **"Import"**

#### 2.3 Configurar Build Settings
Na tela de configuração:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Create React App |
| **Root Directory** | `AprovAI_Codigo_Fonte/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

#### 2.4 Adicionar Variáveis de Ambiente
Na aba **Environment Variables**, adicione:

| Chave | Valor |
|-------|-------|
| `REACT_APP_SUPABASE_URL` | URL do projeto Supabase |
| `REACT_APP_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

Clique em **"Add"** para cada variável.

### 3. Deploy

#### 3.1 Realizar Deploy Inicial
Clique em **"Deploy"** para iniciar o build.

Aguarde (geralmente 2-5 minutos).

#### 3.2 Verificar Deploy
- Você receberá um URL como: `https://seu-projeto.vercel.app`
- Clique no link para acessar a aplicação
- Teste o login e funcionalidades

### 4. Configurar Domínio Customizado (Opcional)

1. Na dashboard Vercel, vá para **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `aprovai.com`)
4. Siga as instruções de DNS

### 5. Variáveis de Ambiente no Vercel

Se precisar atualizar variáveis:

1. Vá para **Settings** → **Environment Variables**
2. Edite ou adicione novas variáveis
3. Clique em **Save**
4. Redeploy clicando em **Redeploy** na aba **Deployments**

### 6. Deployments Automáticos

Por padrão, Vercel fará deploy automático quando você fazer push:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

Vercel detectará a mudança e iniciará o build automaticamente.

### 7. Monitorar Deployments

1. Na dashboard Vercel, abra seu projeto
2. Vá para a aba **"Deployments"**
3. Veja o status de cada deploy (em progresso, completo, falhou)
4. Clique em um deploy para ver logs

### 8. Rollback (Reverter para Deploy Anterior)

Se algo der errado:

1. Aba **"Deployments"**
2. Procure o deployment anterior que funcionava
3. Clique no menu (⋯) e selecione **"Promote to Production"**

### 9. Desabilitar Deployments Automáticos (Opcional)

1. **Settings** → **Git** → **Deploy Hooks**
2. Crie um hook customizado se necessário

## 📚 Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0",
  "@supabase/supabase-js": "^2.39.0",
  "lucide-react": "^0.303.0",
  "react-hot-toast": "^2.4.1",
  "typescript": "^4.9.5"
}
```

## 🔐 Segurança

### Boas Práticas
- ✅ Nunca commit arquivo `.env` (está em `.gitignore`)
- ✅ Use variáveis de ambiente para dados sensíveis
- ✅ Valide entrada do usuário no frontend e backend
- ✅ Use HTTPS em produção (Vercel fornece por padrão)
- ✅ Mantenha dependências atualizadas

### Atualizar Dependências
```bash
npm update
npm audit
npm audit fix
```

## 🐛 Troubleshooting

### Erro: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Erro: "REACT_APP_SUPABASE_URL não está definido"
1. Verifique arquivo `.env`
2. Certifique-se de reiniciar o servidor (`npm start`)
3. Limpe variáveis de ambiente do navegador (DevTools → Application → Local Storage)

### Porta 3000 já está em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Build falha no Vercel
1. Verifique logs no Vercel Dashboard → **Deployments** → [seu deploy]
2. Confirme que `Root Directory` está correto: `AprovAI_Codigo_Fonte/frontend`
3. Verifique `package.json` tem script `build`

## 📝 Licença

Este projeto está sob licença [MIT](LICENSE).

## 👤 Autor

**Thiago Flausino**
- GitHub: [@ThiagoSDFlausino](https://github.com/ThiagoSDFlausino)

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Última atualização**: 01/07/2026

Para mais informações, consulte a [documentação do Supabase](https://supabase.com/docs) ou [React](https://react.dev).
