export function UserAccessFields({ editingUser, filiais, form, updateForm }) {
  return (
    <>
      <div className="form-section-title">Acesso</div>
      <label className="form-control">
        <span>Nome</span>
        <input
          value={form.nome}
          onChange={(event) => updateForm("nome", event.target.value)}
          placeholder="Nome completo"
        />
      </label>

      <label className="form-control">
        <span>Login</span>
        <input
          value={form.login}
          onChange={(event) => updateForm("login", event.target.value)}
          placeholder="usuário.login"
        />
      </label>

      <label className="form-control">
        <span>{editingUser ? "Nova senha" : "Senha inicial"}</span>
        <input
          type="password"
          value={form.senha}
          onChange={(event) => updateForm("senha", event.target.value)}
          placeholder={editingUser ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
        />
      </label>

      <label className="form-control">
        <span>Perfil</span>
        <select
          value={form.perfil}
          onChange={(event) => updateForm("perfil", event.target.value)}
        >
          <option value="VENDEDOR">Vendedor</option>
          <option value="OPERADOR_CAIXA">Operador(a) de caixa</option>
          <option value="ESTOQUISTA">Estoquista</option>
          <option value="FINANCEIRO">Financeiro</option>
          <option value="GERENTE">Gerente</option>
        </select>
      </label>

      <label className="form-control">
        <span>Filial</span>
        <select
          value={form.filialId}
          onChange={(event) => updateForm("filialId", event.target.value)}
        >
          <option value="">Empresa / sem filial</option>
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
