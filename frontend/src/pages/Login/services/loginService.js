import { login } from "../../../services/auth";
import { endpoints } from "../../../services/resources";

export const loginService = {
  authenticate(credentials) {
    return login(credentials);
  },

  requestPasswordRecovery(userLogin) {
    return endpoints.auth.recuperarSenha(userLogin);
  },

  resetPassword(token, newPassword) {
    return endpoints.auth.resetarSenha(token, newPassword);
  },
};
