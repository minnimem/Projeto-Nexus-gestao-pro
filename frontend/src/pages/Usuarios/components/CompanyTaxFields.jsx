export function CompanyTaxFields({ companyForm, updateCompanyForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Inscricao estadual</span>
          <input
            value={companyForm.inscricaoEstadual}
            onChange={(event) => updateCompanyForm("inscricaoEstadual", event.target.value)}
            placeholder="IE"
          />
        </label>
        <label className="form-control">
          <span>Inscricao municipal</span>
          <input
            value={companyForm.inscricaoMunicipal}
            onChange={(event) => updateCompanyForm("inscricaoMunicipal", event.target.value)}
            placeholder="IM"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Regime tributario</span>
          <select
            value={companyForm.regimeTributario}
            onChange={(event) => updateCompanyForm("regimeTributario", event.target.value)}
          >
            <option value="">Pendente</option>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
            <option value="MEI">MEI</option>
          </select>
        </label>
        <label className="form-control">
          <span>CRT</span>
          <select
            value={companyForm.crt}
            onChange={(event) => updateCompanyForm("crt", event.target.value)}
          >
            <option value="">Pendente</option>
            <option value="1">1 - Simples Nacional</option>
            <option value="2">2 - Simples excesso sublimite</option>
            <option value="3">3 - Regime Normal</option>
            <option value="4">4 - MEI</option>
          </select>
        </label>
      </div>
    </>
  );
}
