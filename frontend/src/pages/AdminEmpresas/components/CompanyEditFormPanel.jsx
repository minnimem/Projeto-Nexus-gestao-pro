import { Loader2, ShieldCheck } from "lucide-react";

export function CompanyEditFormPanel({
  editCompanyForm,
  handleEditCompanySubmit,
  savingCompanyEdit,
  selectedCompany,
  updateEditCompanyForm,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Dados cadastrais</h2>
            <p>Identificação comercial e fiscal básica da empresa selecionada.</p>
          </div>
          <span>{selectedCompany.ativo === false ? "Inativa" : "Ativa"}</span>
        </div>

        <form className="compact-form company-form" onSubmit={handleEditCompanySubmit}>
          <div className="finance-form-row">
            <label className="form-control">
              <span>Nome fantasia</span>
              <input value={editCompanyForm.nome} onChange={(event) => updateEditCompanyForm("nome", event.target.value)} placeholder="Nome da empresa" />
            </label>
            <label className="form-control">
              <span>Razão social</span>
              <input value={editCompanyForm.razaoSocial} onChange={(event) => updateEditCompanyForm("razaoSocial", event.target.value)} placeholder="Razão social" />
            </label>
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>CNPJ</span>
              <input value={editCompanyForm.cnpj} onChange={(event) => updateEditCompanyForm("cnpj", event.target.value)} placeholder="00.000.000/0000-00" />
            </label>
            <label className="form-control">
              <span>Email</span>
              <input value={editCompanyForm.email} onChange={(event) => updateEditCompanyForm("email", event.target.value)} placeholder="contato@empresa.com" />
            </label>
            <label className="form-control">
              <span>Telefone</span>
              <input value={editCompanyForm.telefone} onChange={(event) => updateEditCompanyForm("telefone", event.target.value)} placeholder="(00) 00000-0000" />
            </label>
          </div>

          <label className="form-control">
            <span>Endereço</span>
            <input value={editCompanyForm.endereco} onChange={(event) => updateEditCompanyForm("endereco", event.target.value)} placeholder="Rua, número, bairro" />
          </label>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Cidade</span>
              <input value={editCompanyForm.cidade} onChange={(event) => updateEditCompanyForm("cidade", event.target.value)} placeholder="Cidade" />
            </label>
            <label className="form-control">
              <span>UF</span>
              <input maxLength="2" value={editCompanyForm.uf} onChange={(event) => updateEditCompanyForm("uf", event.target.value.toUpperCase())} placeholder="SP" />
            </label>
            <label className="form-control">
              <span>CEP</span>
              <input maxLength={9} value={editCompanyForm.cep} onChange={(event) => updateEditCompanyForm("cep", event.target.value)} placeholder="00000-000" />
            </label>
            <label className="form-control">
              <span>Código município</span>
              <input maxLength={7} value={editCompanyForm.codigoMunicipio} onChange={(event) => updateEditCompanyForm("codigoMunicipio", event.target.value)} placeholder="IBGE" />
            </label>
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Inscrição estadual</span>
              <input value={editCompanyForm.inscricaoEstadual} onChange={(event) => updateEditCompanyForm("inscricaoEstadual", event.target.value)} placeholder="IE" />
            </label>
            <label className="form-control">
              <span>Inscrição municipal</span>
              <input value={editCompanyForm.inscricaoMunicipal} onChange={(event) => updateEditCompanyForm("inscricaoMunicipal", event.target.value)} placeholder="IM" />
            </label>
            <label className="form-control">
              <span>Regime tributário</span>
              <select value={editCompanyForm.regimeTributario} onChange={(event) => updateEditCompanyForm("regimeTributario", event.target.value)}>
                <option value="">Pendente</option>
                <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
                <option value="MEI">MEI</option>
              </select>
            </label>
            <label className="form-control">
              <span>CRT</span>
              <select value={editCompanyForm.crt} onChange={(event) => updateEditCompanyForm("crt", event.target.value)}>
                <option value="">Pendente</option>
                <option value="1">1 - Simples Nacional</option>
                <option value="2">2 - Simples excesso sublimite</option>
                <option value="3">3 - Regime Normal</option>
                <option value="4">4 - MEI</option>
              </select>
            </label>
          </div>

          <button className="checkout-button" disabled={savingCompanyEdit || !selectedCompany.id} type="submit">
            {savingCompanyEdit ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
            {savingCompanyEdit ? "Salvando..." : "Salvar dados cadastrais"}
          </button>
        </form>
      </article>
    </section>
  );
}
