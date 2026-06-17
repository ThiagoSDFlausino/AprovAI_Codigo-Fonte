  
import AuthDAO from '../dao/AuthDAO';

const AuthRepository = {
  async login(email, password) {
    return await AuthDAO.signInWithEmail(email, password);
  },

  async register(email, password, userMetadata) {
    return await AuthDAO.signUpWithEmail(email, password, userMetadata);
  },

  async logout() {
    return await AuthDAO.signOut();
  },

  async getCurrentSession() {
    return await AuthDAO.getSession();
  },

  async getCurrentUser() {
    return await AuthDAO.getUser();
  },

  onAuthStateChange(callback) {
    return AuthDAO.onAuthStateChange(callback);
  }
};

export default AuthRepository;
