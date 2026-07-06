import { initialPasswordResetForm } from "../constants/loginFormDefaults";
import { loginService } from "../services/loginService";
import { validatePasswordResetForm, validateRecoveryLogin } from "../services/loginValidation";

export function useLoginActions({
  form,
  onLogin,
  resetForm,
  setAuthMode,
  setError,
  setForm,
  setLoading,
  setResetForm,
  setSuccess,
}) {
  function startRequest() {
    setLoading(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    startRequest();
    try {
      const session = await loginService.authenticate(form);
      onLogin(session);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecover(event) {
    event.preventDefault();
    const validationError = validateRecoveryLogin(resetForm.login);
    if (validationError) {
      setError(validationError);
      return;
    }

    startRequest();
    try {
      await loginService.requestPasswordRecovery(resetForm.login.trim());
      setSuccess("Solicitação registrada. Use o token gerado no console do Spring Boot para definir uma nova senha.");
      setAuthMode("reset");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    const validationError = validatePasswordResetForm(resetForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    startRequest();
    try {
      await loginService.resetPassword(resetForm.token.trim(), resetForm.novaSenha);
      setSuccess("Senha alterada com sucesso. Entre novamente com a nova senha.");
      setAuthMode("login");
      setForm((current) => ({ ...current, senha: "" }));
      setResetForm(initialPasswordResetForm);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    handleRecover,
    handleResetPassword,
    handleSubmit,
  };
}
