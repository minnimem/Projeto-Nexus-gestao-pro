const originOptions = [
  ["", "Pendente"],
  ["0", "0 - Nacional"],
  ["1", "1 - Estrangeira direta"],
  ["2", "2 - Estrangeira mercado interno"],
  ["3", "3 - Nacional importação > 40%"],
  ["4", "4 - Nacional conforme PPB"],
  ["5", "5 - Nacional importação <= 40%"],
  ["6", "6 - Estrangeira direta sem similar"],
  ["7", "7 - Estrangeira mercado interno sem similar"],
  ["8", "8 - Nacional importação > 70%"],
];

export function ProductFiscalIdentityFields({ form, updateForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>NCM</span>
          <input inputMode="numeric" maxLength={8} value={form.ncm} onChange={(event) => updateForm("ncm", event.target.value)} placeholder="Ex.: 84713012" />
        </label>
        <label className="form-control">
          <span>CFOP</span>
          <input inputMode="numeric" maxLength={4} value={form.cfop} onChange={(event) => updateForm("cfop", event.target.value)} placeholder="Ex.: 5102" />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>CEST</span>
          <input inputMode="numeric" maxLength={7} value={form.cest} onChange={(event) => updateForm("cest", event.target.value)} placeholder="Opcional" />
        </label>
        <label className="form-control">
          <span>Origem</span>
          <select value={form.origemFiscal} onChange={(event) => updateForm("origemFiscal", event.target.value)}>
            {originOptions.map(([value, label]) => <option key={value || "pending"} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Unidade fiscal</span>
          <input maxLength={6} value={form.unidadeComercial} onChange={(event) => updateForm("unidadeComercial", event.target.value)} placeholder="UN" />
        </label>
        <label className="form-control">
          <span>CST ICMS</span>
          <input inputMode="numeric" maxLength={3} value={form.cstIcms} onChange={(event) => updateForm("cstIcms", event.target.value)} placeholder="Ex.: 000" />
        </label>
        <label className="form-control">
          <span>CSOSN</span>
          <input inputMode="numeric" maxLength={3} value={form.csosn} onChange={(event) => updateForm("csosn", event.target.value)} placeholder="Ex.: 102" />
        </label>
      </div>
    </>
  );
}
