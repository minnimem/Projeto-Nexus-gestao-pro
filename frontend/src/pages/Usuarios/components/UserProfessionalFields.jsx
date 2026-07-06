export function UserProfessionalFields({ form, updateForm }) {
  return (
    <>
      <div className="form-section-title">Dados profissionais</div>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Cargo</span>
          <input
            value={form.cargo}
            onChange={(event) => updateForm("cargo", event.target.value)}
            placeholder="Ex.: Gerente de vendas"
          />
        </label>
        <label className="form-control">
          <span>Departamento</span>
          <input
            value={form.departamento}
            onChange={(event) => updateForm("departamento", event.target.value)}
            placeholder="Ex.: Comercial"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Salario</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.salario}
            onChange={(event) => updateForm("salario", event.target.value)}
            placeholder="0,00"
          />
        </label>
        <label className="form-control">
          <span>Data inicio</span>
          <input
            type="date"
            value={form.dataInicio}
            onChange={(event) => updateForm("dataInicio", event.target.value)}
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Meta de vendas</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.metaVendas}
            onChange={(event) => updateForm("metaVendas", event.target.value)}
            placeholder="0,00"
          />
        </label>
      </div>
    </>
  );
}
