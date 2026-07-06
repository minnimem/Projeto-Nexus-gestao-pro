import { Download, Plus, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";
import { CompaniesTablePanel } from "./CompaniesTablePanel";
import { NewCompanyForm } from "./NewCompanyForm";

export function CompaniesManagementPanel({
  companyForm,
  companyPlanFilter,
  companyRows,
  companySearch,
  companyStatusFilter,
  empresas,
  filteredCompanies,
  getCompanyRiskSignals,
  handleCompanySubmit,
  savingCompany,
  selectedCompany,
  setCompanyPlanFilter,
  setCompanySearch,
  setCompanyStatusFilter,
  setSelectedCompanyId,
  setShowCompanyForm,
  showCompanyForm,
  updateCompanyForm,
}) {
  return (
    <article className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Empresas</h2>
          <p>Cadastro comercial, plano atual e uso operacional.</p>
        </div>
        <div className="account-plan-actions">
          <button onClick={() => setShowCompanyForm((current) => !current)} type="button">
            <Plus size={15} />
            Nova empresa
          </button>
          <button
            disabled={companyRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-empresas-master-${getLocalDateKey()}.csv`, companyRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={companyRows.length === 0}
            onClick={() => printRowsDocument("Empresas master", companyRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      {showCompanyForm && (
        <NewCompanyForm
          companyForm={companyForm}
          handleCompanySubmit={handleCompanySubmit}
          savingCompany={savingCompany}
          setShowCompanyForm={setShowCompanyForm}
          updateCompanyForm={updateCompanyForm}
        />
      )}

      <CompaniesTablePanel
        companyPlanFilter={companyPlanFilter}
        companySearch={companySearch}
        companyStatusFilter={companyStatusFilter}
        empresas={empresas}
        filteredCompanies={filteredCompanies}
        getCompanyRiskSignals={getCompanyRiskSignals}
        selectedCompany={selectedCompany}
        setCompanyPlanFilter={setCompanyPlanFilter}
        setCompanySearch={setCompanySearch}
        setCompanyStatusFilter={setCompanyStatusFilter}
        setSelectedCompanyId={setSelectedCompanyId}
      />
    </article>
  );
}
