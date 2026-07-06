import { useLoginActions } from "./hooks/useLoginActions";
import { useLoginPageState } from "./hooks/useLoginPageState";
import { LoginBrandPanel } from "./components/LoginBrandPanel";
import { LoginAuthForm } from "./components/LoginAuthForm";
import "./Login.css";

export function Login({ onLogin }) {
  const state = useLoginPageState();
  const {
    authMode,
    error,
    form,
    loading,
    resetForm,
    setAuthMode,
    setError,
    setForm,
    setLoading,
    setResetForm,
    setSuccess,
    success,
  } = state;

  const {
    handleRecover,
    handleResetPassword,
    handleSubmit,
  } = useLoginActions({
    form,
    onLogin,
    resetForm,
    setAuthMode,
    setError,
    setForm,
    setLoading,
    setResetForm,
    setSuccess,
  });

  return (
    <main className="login-page">
      <LoginBrandPanel />

      <LoginAuthForm
        authMode={authMode}
        error={error}
        form={form}
        loading={loading}
        onRecover={handleRecover}
        onResetPassword={handleResetPassword}
        onSubmit={handleSubmit}
        resetForm={resetForm}
        setAuthMode={setAuthMode}
        setError={setError}
        setForm={setForm}
        setResetForm={setResetForm}
        setSuccess={setSuccess}
        success={success}
      />
    </main>
  );
}
