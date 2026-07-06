import { Loader2, ShieldCheck, X } from "lucide-react";

const COMPANY_LIMIT_FIELDS = [
  ["limiteUsuarios", "Usuários"],
  ["limiteFiliais", "Filiais"],
  ["limiteCaixas", "Caixas"],
  ["limiteProdutos", "Produtos"],
];

const COMPANY_ADDON_FIELDS = [
  ["fiscalLiberado", "Fiscal real"],
  ["pagamentosLiberado", "Pagamentos reais"],
  ["notificacoesLiberado", "Notificações externas"],
  ["logisticaLiberada", "Logística"],
  ["servicosLiberado", "Serviços/OS"],
  ["auditoriaAvancadaLiberada", "Auditoria avançada"],
];

export function NewCompanyForm({
  companyForm,
  handleCompanySubmit,
  savingCompany,
  setShowCompanyForm,
  updateCompanyForm,
}) {
  return (
    <form className="compact-form company-form inline-panel" onSubmit={handleCompanySubmit}>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Empresa</span>
          <input value={companyForm.nome} onChange={(event) => updateCompanyForm("nome", event.target.value)} placeholder="Nome fantasia" />
        </label>
        <label className="form-control">
          <span>Razão social</span>
          <input value={companyForm.razaoSocial} onChange={(event) => updateCompanyForm("razaoSocial", event.target.value)} placeholder="Razão social" />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>CNPJ</span>
          <input value={companyForm.cnpj} onChange={(event) => updateCompanyForm("cnpj", event.target.value)} placeholder="00.000.000/0000-00" />
        </label>
        <label className="form-control">
          <span>Email</span>
          <input value={companyForm.email} onChange={(event) => updateCompanyForm("email", event.target.value)} placeholder="contato@empresa.com" />
        </label>
        <label className="form-control">
          <span>Telefone</span>
          <input value={companyForm.telefone} onChange={(event) => updateCompanyForm("telefone", event.target.value)} placeholder="(00) 00000-0000" />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Cidade</span>
          <input value={companyForm.cidade} onChange={(event) => updateCompanyForm("cidade", event.target.value)} placeholder="Cidade" />
        </label>
        <label className="form-control">
          <span>UF</span>
          <input maxLength="2" value={companyForm.uf} onChange={(event) => updateCompanyForm("uf", event.target.value.toUpperCase())} placeholder="SP" />
        </label>
        <label className="form-control">
          <span>Plano</span>
          <select value={companyForm.planoComercial} onChange={(event) => updateCompanyForm("planoComercial", event.target.value)}>
            <option value="STARTER">Starter</option>
            <option value="BUSINESS">Business</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </label>
        <label className="form-control">
          <span>Status</span>
          <select value={companyForm.statusAssinatura} onChange={(event) => updateCompanyForm("statusAssinatura", event.target.value)}>
            <option value="TESTE">Teste</option>
            <option value="ATIVA">Ativa</option>
            <option value="PENDENTE">Pendente</option>
            <option value="SUSPENSA">Suspensa</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </label>
      </div>

      <div className="finance-form-row">
        {COMPANY_LIMIT_FIELDS.map(([field, label]) => (
          <label className="form-control" key={field}>
            <span>{label}</span>
            <input min="0" type="number" value={companyForm[field]} onChange={(event) => updateCompanyForm(field, event.target.value)} />
          </label>
        ))}
      </div>

      <div className="account-plan-grid compact-catalog-grid">
        {COMPANY_ADDON_FIELDS.map(([field, label]) => (
          <label className="account-plan-item" key={field}>
            <span>{label}</span>
            <input checked={Boolean(companyForm[field])} onChange={(event) => updateCompanyForm(field, event.target.checked)} type="checkbox" />
            <small>{companyForm[field] ? "Ativo na entrada" : "Bloqueado na entrada"}</small>
          </label>
        ))}
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Admin inicial</span>
          <input value={companyForm.adminNome} onChange={(event) => updateCompanyForm("adminNome", event.target.value)} placeholder="Nome do administrador" />
        </label>
        <label className="form-control">
          <span>Login admin</span>
          <input value={companyForm.adminLogin} onChange={(event) => updateCompanyForm("adminLogin", event.target.value)} placeholder="login.admin" />
        </label>
        <label className="form-control">
          <span>Senha inicial</span>
          <input type="password" value={companyForm.adminSenha} onChange={(event) => updateCompanyForm("adminSenha", event.target.value)} placeholder="Mínimo 6 caracteres" />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Email admin</span>
          <input value={companyForm.adminEmail} onChange={(event) => updateCompanyForm("adminEmail", event.target.value)} placeholder="admin@empresa.com" />
        </label>
        <label className="form-control">
          <span>Telefone admin</span>
          <input value={companyForm.adminTelefone} onChange={(event) => updateCompanyForm("adminTelefone", event.target.value)} placeholder="(00) 00000-0000" />
        </label>
      </div>

      <div className="account-plan-actions">
        <button className="checkout-button" disabled={savingCompany} type="submit">
          {savingCompany ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
          {savingCompany ? "Criando..." : "Criar empresa e admin"}
        </button>
        <button className="ghost-button" disabled={savingCompany} onClick={() => setShowCompanyForm(false)} type="button">
          <X size={15} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
