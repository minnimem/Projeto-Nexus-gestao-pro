import { Loader2, ShieldCheck } from "lucide-react";

export function PasswordResetFields({ loading, resetForm, setAuthMode, setResetForm }) {
  return (
    <>
      <label>
        <span>Token</span>
        <input
          onChange={(event) => setResetForm((current) => ({ ...current, token: event.target.value }))}
          placeholder="Cole o token de recuperação"
          required
          value={resetForm.token}
        />
      </label>
      <label>
        <span>Nova senha</span>
        <input
          onChange={(event) => setResetForm((current) => ({ ...current, novaSenha: event.target.value }))}
          placeholder="Mínimo 6 caracteres"
          required
          type="password"
          value={resetForm.novaSenha}
        />
      </label>
      <label>
        <span>Confirmar senha</span>
        <input
          onChange={(event) => setResetForm((current) => ({ ...current, confirmarSenha: event.target.value }))}
          placeholder="Repita a nova senha"
          required
          type="password"
          value={resetForm.confirmarSenha}
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
        {loading ? "Alterando..." : "Alterar senha"}
      </button>
      <button className="auth-link-button" onClick={() => setAuthMode("login")} type="button">
        Voltar ao login
      </button>
    </>
  );
}
