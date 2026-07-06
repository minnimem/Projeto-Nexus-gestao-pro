import { ShieldCheck } from "lucide-react";
import { LoginCredentialsFields } from "./LoginCredentialsFields";
import { PasswordRecoveryFields } from "./PasswordRecoveryFields";
import { PasswordResetFields } from "./PasswordResetFields";
import "./LoginAuthForm.css";

export function LoginAuthForm({
  authMode,
  error,
  form,
  loading,
  onRecover,
  onResetPassword,
  onSubmit,
  resetForm,
  setAuthMode,
  setError,
  setForm,
  setResetForm,
  setSuccess,
  success,
}) {
  const submitHandler = authMode === "recover"
    onRecover
    : authMode === "reset"
      onResetPassword
      : onSubmit;

  return (
    <section className="form-panel">
      <form className="login-card" onSubmit={submitHandler}>
        <div className="secure">
          <ShieldCheck size={16} />
          API protegida por JWT
        </div>

        <header>
          <h2>
            {authMode === "recover"
              ? "Recuperar senha"
              : authMode === "reset"
                ? "Nova senha"
                : "Acesse sua conta"}
          </h2>
          <p>
            {authMode === "recover"
              ? "Informe seu login para gerar um token de recuperação."
              : authMode === "reset"
                ? "Informe o token recebido e defina uma nova senha."
                : "Use o login cadastrado no Spring Boot."}
          </p>
        </header>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {authMode === "login" && (
          <LoginCredentialsFields
            form={form}
            loading={loading}
            onRecoverMode={() => {
                setError("");
                setSuccess("");
                setResetForm((current) => ({ ...current, login: form.login }));
                setAuthMode("recover");
            }}
            setForm={setForm}
          />
        )}

        {authMode === "recover" && (
          <PasswordRecoveryFields
            loading={loading}
            resetForm={resetForm}
            setAuthMode={setAuthMode}
            setResetForm={setResetForm}
          />
        )}

        {authMode === "reset" && (
          <PasswordResetFields
            loading={loading}
            resetForm={resetForm}
            setAuthMode={setAuthMode}
            setResetForm={setResetForm}
          />
        )}
      </form>
    </section>
  );
}
