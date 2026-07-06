import { Loader2, ShieldCheck } from "lucide-react";
import {
  CompanyAddressFields,
  CompanyIdentityFields,
  CompanyTaxFields,
} from "./CompanyFormFields";

export function CompanySection({
  companyForm,
  empresa,
  handleCompanySubmit,
  savingCompany,
  session,
  updateCompanyForm,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Empresa</h2>
            <p>Dados usados em documentos, relatórios e identificação do sistema.</p>
          </div>
          <span>{empresa.nome || session.empresa || "Empresa"}</span>
        </div>

        <form className="compact-form company-form" onSubmit={handleCompanySubmit}>
          <CompanyIdentityFields companyForm={companyForm} updateCompanyForm={updateCompanyForm} />
          <CompanyTaxFields companyForm={companyForm} updateCompanyForm={updateCompanyForm} />
          <CompanyAddressFields companyForm={companyForm} updateCompanyForm={updateCompanyForm} />

          <button className="checkout-button" disabled={savingCompany} type="submit">
            {savingCompany ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
            {savingCompany ? "Salvando..." : "Salvar dados da empresa"}
          </button>
        </form>
      </article>
    </section>
  );
}
