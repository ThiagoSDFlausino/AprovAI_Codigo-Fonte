import AuthService from '../../Auth/Service/AuthService';

function getAuthErrorInfo(error) {
  const code = (error && typeof error === 'object' && error.code) || '';
  const message = (error && typeof error === 'object' && error.message) || String(error || '');
  return { code: String(code).toLowerCase(), message: String(message) };
}

function isEmailNotConfirmedError(error) {
  const { code, message } = getAuthErrorInfo(error);
  const m = message.toLowerCase();
  return (
    code === 'email_not_confirmed' ||
    m.includes('email not confirmed') ||
    m.includes('e-mail não confirmado') ||
    m.includes('email nao confirmado')
  );
}

const AuthController = {
  async handleLogin(email, password, navigate, toast, refreshProfile) {
    try {
      const { data } = await AuthService.login(email, password);

      if (typeof refreshProfile === 'function' && data?.user?.id) {
        await refreshProfile(data.user.id);
      }

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      const { message: msg } = getAuthErrorInfo(error);
      if (msg.includes('Invalid login credentials')) {
        toast.error('Senha incorreta. Verifique suas credenciais.');
      } else if (isEmailNotConfirmedError(error)) {
        toast.error(
          'Este usuário ainda está como “e-mail não confirmado” no Auth (contas antigas). No Supabase: Authentication → Users → menu do usuário → Confirm email. Ou rode o SQL do README (secção “E-mails já existentes”).',
          { duration: 9000 },
        );
      } else {
        toast.error(msg || 'Erro ao fazer login');
      }
    }
  },

  async handleRegister(formData, navigate, toast) {
    const { email, password, confirmPassword, name } = formData;

    if (!name || name.trim().length < 2) {
      toast.error('Nome deve ter ao menos 2 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    try {
      await AuthService.CadastroUsuario(email, password, name.trim());
      toast.success('Conta criada! Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      const msg = error.message || 'Erro ao criar conta';
      if (msg.includes('User already registered')) {
        toast.error('Este email já está cadastrado.');
      } else {
        toast.error(msg);
      }
    }
  },

  async handleLogout(navigate, toast) {
    try {
      await AuthService.logout();
      toast.success('Até logo!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao sair.');
    }
  }
};

export default AuthController;
