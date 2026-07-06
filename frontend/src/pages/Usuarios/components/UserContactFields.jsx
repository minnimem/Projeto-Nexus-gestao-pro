export function UserContactFields({ form, updateForm }) {
  return (
    <>
      <div className="form-section-title">Contato</div>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Telefone</span>
          <input
            value={form.telefone}
            onChange={(event) => updateForm("telefone", event.target.value)}
            placeholder="(00) 00000-0000"
          />
        </label>
        <label className="form-control">
          <span>Documento</span>
          <input
            value={form.documento}
            onChange={(event) => updateForm("documento", event.target.value)}
            placeholder="CPF ou documento"
          />
        </label>
      </div>

      <label className="form-control">
        <span>Email</span>
        <input
          value={form.email}
          onChange={(event) => updateForm("email", event.target.value)}
          placeholder="colaborador@empresa.com"
        />
      </label>
    </>
  );
}
