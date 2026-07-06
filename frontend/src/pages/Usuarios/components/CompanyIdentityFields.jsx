export function CompanyIdentityFields({ companyForm, updateCompanyForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Nome fantasia</span>
          <input
            value={companyForm.nome}
            onChange={(event) => updateCompanyForm("nome", event.target.value)}
            placeholder="Nome da empresa"
          />
        </label>
        <label className="form-control">
          <span>Razão social</span>
          <input
            value={companyForm.razaoSocial}
            onChange={(event) => updateCompanyForm("razaoSocial", event.target.value)}
            placeholder="Razão social"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>CNPJ</span>
          <input
            value={companyForm.cnpj}
            onChange={(event) => updateCompanyForm("cnpj", event.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </label>
        <label className="form-control">
          <span>Telefone</span>
          <input
            value={companyForm.telefone}
            onChange={(event) => updateCompanyForm("telefone", event.target.value)}
            placeholder="(00) 00000-0000"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Email</span>
          <input
            value={companyForm.email}
            onChange={(event) => updateCompanyForm("email", event.target.value)}
            placeholder="contato@empresa.com"
          />
        </label>
        <label className="form-control">
          <span>Estoque mínimo padrão</span>
          <input
            min="0"
            type="number"
            value={companyForm.estoqueMinimoPadrao}
            onChange={(event) => updateCompanyForm("estoqueMinimoPadrao", event.target.value)}
          />
        </label>
      </div>
    </>
  );
}
