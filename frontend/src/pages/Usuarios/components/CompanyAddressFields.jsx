export function CompanyAddressFields({ companyForm, updateCompanyForm }) {
  return (
    <>
      <label className="form-control">
        <span>Endereco</span>
        <input
          value={companyForm.endereco}
          onChange={(event) => updateCompanyForm("endereco", event.target.value)}
          placeholder="Rua, número, bairro"
        />
      </label>

      <div className="finance-form-row">
        <label className="form-control">
          <span>CEP</span>
          <input
            inputMode="numeric"
            maxLength={9}
            value={companyForm.cep}
            onChange={(event) => updateCompanyForm("cep", event.target.value)}
            placeholder="00000-000"
          />
        </label>
        <label className="form-control">
          <span>Código município</span>
          <input
            inputMode="numeric"
            maxLength={7}
            value={companyForm.codigoMunicipio}
            onChange={(event) => updateCompanyForm("codigoMunicipio", event.target.value)}
            placeholder="IBGE"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Cidade</span>
          <input
            value={companyForm.cidade}
            onChange={(event) => updateCompanyForm("cidade", event.target.value)}
            placeholder="Cidade"
          />
        </label>
        <label className="form-control">
          <span>UF</span>
          <input
            maxLength="2"
            value={companyForm.uf}
            onChange={(event) => updateCompanyForm("uf", event.target.value.toUpperCase())}
            placeholder="SP"
          />
        </label>
      </div>
    </>
  );
}
