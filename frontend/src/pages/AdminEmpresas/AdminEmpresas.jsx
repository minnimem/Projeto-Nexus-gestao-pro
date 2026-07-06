import { useEffect, useState } from "react";
import { endpoints } from "../../services/resources.js";
import {
  initialMasterCompanyForm,
  liberationStatuses,
} from "../../constants/admin.js";
import { AdminCompaniesKpiPanel } from "./components/AdminCompaniesKpiPanel.jsx";
import { CompaniesManagementPanel } from "./components/CompaniesManagementPanel.jsx";
import { CompanyEditFormPanel } from "./components/CompanyEditFormPanel.jsx";
import { CompanyPlanFormPanel } from "./components/CompanyPlanFormPanel.jsx";
import { ControlledAddonsPanel } from "./components/ControlledAddonsPanel.jsx";
import { SelectedCompanySummaryPanel } from "./components/SelectedCompanySummaryPanel.jsx";
import {
  buildControlledAddonPayload,
  buildEditMasterCompanyPayload,
  buildMasterCompanyPayload,
  buildMasterCompanyStatusPayload,
  validateEditMasterCompanyForm,
  validateMasterCompanyForm,
} from "./services/adminCompanyRules.js";
import { getCompanyRiskSignals } from "./viewModels/adminCompanyViewModel.js";
import { useAdminCompaniesData } from "./hooks/useAdminCompaniesData.js";
import { useAdminCompaniesState } from "./hooks/useAdminCompaniesState.js";
import "./AdminEmpresas.css";

export function AdminEmpresas({ data, onRefresh }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const {
    commercialHistory,
    companyForm,
    companyPlanFilter,
    companySearch,
    companyStatusFilter,
    editCompanyForm,
    empresas,
    message,
    planDraft,
    planObservation,
    releaseDrafts,
    savingCompany,
    savingCompanyEdit,
    savingCompanyStatus,
    savingPlan,
    savingReleaseModule,
    selectedCompany,
    selectedLiberationRows,
    setCompanyForm,
    setCompanyPlanFilter,
    setCompanySearch,
    setCompanyStatusFilter,
    setEditCompanyForm,
    setMessage,
    setPlanDraft,
    setPlanObservation,
    setReleaseDrafts,
    setSavingCompany,
    setSavingCompanyEdit,
    setSavingCompanyStatus,
    setSavingPlan,
    setSavingReleaseModule,
    setShowCompanyForm,
    setStatusObservation,
    showCompanyForm,
    statusObservation,
  } = useAdminCompaniesState({ data, selectedCompanyId });
  const {
    activeCompanies,
    commercialHistoryRows,
    companiesWithRisk,
    companyRows,
    enterpriseCompanies,
    filteredCompanies,
    suspendedCompanies,
    totalActiveUsers,
  } = useAdminCompaniesData({
    commercialHistory,
    companyPlanFilter,
    companySearch,
    companyStatusFilter,
    empresas,
  });
  useEffect(() => {
    if (!selectedCompanyId && empresas[0].id) {
      setSelectedCompanyId(empresas[0].id);
    }
  }, [empresas.length, selectedCompanyId]);

  function updatePlanDraft(field, value) {
    setPlanDraft((current) => ({ ...current, [field]: value }));
  }

  function updateCompanyForm(field, value) {
    setCompanyForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditCompanyForm(field, value) {
    setEditCompanyForm((current) => ({ ...current, [field]: value }));
  }

  function updateReleaseDraft(modulo, field, value) {
    setReleaseDrafts((current) => ({
      ...current,
      [modulo]: {
        ...(current[modulo] || { modulo }),
        modulo,
        [field]: value,
      },
    }));
  }

  async function handlePlanSubmit(event) {
    event.preventDefault();
    if (!selectedCompany.id) {
      setMessage({ type: "error", text: "Selecione uma empresa para atualizar o plano." });
      return;
    }

    setSavingPlan(true);
    setMessage(null);

    try {
      await endpoints.empresa.masterAtualizarPlano(selectedCompany.id, {
        ...planDraft,
        limiteUsuarios: Number(planDraft.limiteUsuarios || 0),
        limiteFiliais: Number(planDraft.limiteFiliais || 0),
        limiteCaixas: Number(planDraft.limiteCaixas || 0),
        limiteProdutos: Number(planDraft.limiteProdutos || 0),
        valorMensalPlano: planDraft.valorMensalPlano === "" ? null : Number(planDraft.valorMensalPlano || 0),
        diaVencimentoPlano: Number(planDraft.diaVencimentoPlano || 10),
        ultimoPagamentoPlano: planDraft.ultimoPagamentoPlano || null,
        observacaoComercial: planObservation.trim() || null,
      });
      setPlanObservation("");
      setMessage({ type: "success", text: "Plano da empresa atualizado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleCompanySubmit(event) {
    event.preventDefault();

    const validationError = validateMasterCompanyForm(companyForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingCompany(true);
    setMessage(null);

    try {
      const created = await endpoints.empresa.masterCriarEmpresa(buildMasterCompanyPayload(companyForm));
      setCompanyForm(initialMasterCompanyForm);
      setShowCompanyForm(false);
      setSelectedCompanyId(created.id || "");
      setMessage({ type: "success", text: "Empresa e admin inicial criados." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleEditCompanySubmit(event) {
    event.preventDefault();
    if (!selectedCompany.id) {
      setMessage({ type: "error", text: "Selecione uma empresa para editar." });
      return;
    }
    const validationError = validateEditMasterCompanyForm(editCompanyForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingCompanyEdit(true);
    setMessage(null);

    try {
      await endpoints.empresa.masterAtualizarEmpresa(selectedCompany.id, buildEditMasterCompanyPayload(editCompanyForm));
      setMessage({ type: "success", text: "Dados da empresa atualizados." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingCompanyEdit(false);
    }
  }

  async function handleCompanyStatusChange() {
    if (!selectedCompany.id) {
      return;
    }

    const { payload, message: statusMessage } = buildMasterCompanyStatusPayload(selectedCompany, statusObservation);
    setSavingCompanyStatus(true);
    setMessage(null);

    try {
      await endpoints.empresa.masterAlterarStatusEmpresa(selectedCompany.id, payload);
      setStatusObservation("");
      setMessage({ type: "success", text: statusMessage });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingCompanyStatus(false);
    }
  }

  async function handleReleaseSubmit(modulo) {
    const draft = releaseDrafts[modulo];
    if (!selectedCompany.id || !draft) {
      return;
    }

    setSavingReleaseModule(modulo);
    setMessage(null);

    try {
      await endpoints.empresa.masterAtualizarLiberacao(selectedCompany.id, buildControlledAddonPayload(draft));
      setMessage({ type: "success", text: "Adicional atualizado para a empresa." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingReleaseModule(null);
    }
  }

  if (empresas.length === 0) {
    return (
      <div className="empty-selection">
        Nenhuma empresa cadastrada para gestão master.
      </div>
    );
  }

  return (
    <div className="dashboard-grid admin-dashboard">
      {message && <div className={`form-message ${message.type}`}>{message.text}</div>}

      <AdminCompaniesKpiPanel
        activeCompanies={activeCompanies}
        companiesWithRisk={companiesWithRisk}
        empresas={empresas}
        enterpriseCompanies={enterpriseCompanies}
        suspendedCompanies={suspendedCompanies}
        totalActiveUsers={totalActiveUsers}
      />

      <section className="content-grid">
        <CompaniesManagementPanel
          companyForm={companyForm}
          companyPlanFilter={companyPlanFilter}
          companyRows={companyRows}
          companySearch={companySearch}
          companyStatusFilter={companyStatusFilter}
          empresas={empresas}
          filteredCompanies={filteredCompanies}
          getCompanyRiskSignals={getCompanyRiskSignals}
          handleCompanySubmit={handleCompanySubmit}
          savingCompany={savingCompany}
          selectedCompany={selectedCompany}
          setCompanyPlanFilter={setCompanyPlanFilter}
          setCompanySearch={setCompanySearch}
          setCompanyStatusFilter={setCompanyStatusFilter}
          setSelectedCompanyId={setSelectedCompanyId}
          setShowCompanyForm={setShowCompanyForm}
          showCompanyForm={showCompanyForm}
          updateCompanyForm={updateCompanyForm}
        />

        <SelectedCompanySummaryPanel
          handleCompanyStatusChange={handleCompanyStatusChange}
          planDraft={planDraft}
          savingCompanyStatus={savingCompanyStatus}
          selectedCompany={selectedCompany}
          setStatusObservation={setStatusObservation}
          statusObservation={statusObservation}
        />
      </section>
      <CompanyEditFormPanel
        editCompanyForm={editCompanyForm}
        handleEditCompanySubmit={handleEditCompanySubmit}
        savingCompanyEdit={savingCompanyEdit}
        selectedCompany={selectedCompany}
        updateEditCompanyForm={updateEditCompanyForm}
      />

      <CompanyPlanFormPanel
        handlePlanSubmit={handlePlanSubmit}
        planDraft={planDraft}
        planObservation={planObservation}
        savingPlan={savingPlan}
        selectedCompany={selectedCompany}
        setPlanObservation={setPlanObservation}
        updatePlanDraft={updatePlanDraft}
      />

      <ControlledAddonsPanel
        handleReleaseSubmit={handleReleaseSubmit}
        liberationStatuses={liberationStatuses}
        releaseDrafts={releaseDrafts}
        savingReleaseModule={savingReleaseModule}
        selectedCompany={selectedCompany}
        selectedLiberationRows={selectedLiberationRows}
        updateReleaseDraft={updateReleaseDraft}
      />
    </div>
  );
}
