import { Loader2, LockKeyhole } from "lucide-react";

export function LoginCredentialsFields({
  form,
  loading,
  onRecoverMode,
  setForm,
}) {
  return (
    <>
      <label>
        <span>Login</span>
        <input
          autoComplete="username"
          onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))}
          placeholder="Digite seu login"
          required
          value={form.login}
        />
      </label>
      <label>
        <span>Senha</span>
        <input
          autoComplete="current-password"
          onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
          placeholder="Digite sua senha"
          required
          type="password"
          value={form.senha}
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? <Loader2 className="spin" size={18} /> : <LockKeyhole size={18} />}
        {loading ? "Conectando..." : "Entrar no sistema"}
      </button>
      <button className="auth-link-button" onClick={onRecoverMode} type="button">
        Esqueci minha senha
      </button>
    </>
  );
}
