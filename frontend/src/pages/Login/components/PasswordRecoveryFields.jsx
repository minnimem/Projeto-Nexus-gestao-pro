import { Loader2, Mail } from "lucide-react";

export function PasswordRecoveryFields({ loading, resetForm, setAuthMode, setResetForm }) {
  return (
    <>
      <label>
        <span>Login</span>
        <input
          autoComplete="username"
          onChange={(event) => setResetForm((current) => ({ ...current, login: event.target.value }))}
          placeholder="Digite seu login"
          required
          value={resetForm.login}
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? <Loader2 className="spin" size={18} /> : <Mail size={18} />}
        {loading ? "Enviando..." : "Solicitar recuperação"}
      </button>
      <div className="auth-actions-row">
        <button onClick={() => setAuthMode("reset")} type="button">Já tenho token</button>
        <button onClick={() => setAuthMode("login")} type="button">Voltar ao login</button>
      </div>
    </>
  );
}
