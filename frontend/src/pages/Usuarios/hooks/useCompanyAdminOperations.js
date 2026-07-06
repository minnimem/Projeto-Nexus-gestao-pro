import { useEffect, useState } from "react";
import {
  initialBranchForm,
  initialCompanyForm,
  initialContractForm,
  initialPlanForm,
} from "../../../constants/admin";
import { endpoints } from "../../../services/resources";
import {
  buildBranchPayload,
  buildCompanyPayload,
  buildContractPayload,
  buildPlanPayload,
} from "../utils/companyPayloads";
import {
  buildCompanyFormDraft,
  buildPlanFormDraft,
  buildReleaseDrafts,
} from "../utils/formDrafts";

export function useCompanyAdminOperations({
  empresa,
  liberacoes,
  liberationRows,
  onRefresh,
  setMessage,
}) {
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [planForm, setPlanForm] = useState(initialPlanForm);
  const [releaseDrafts, setReleaseDrafts] = useState({});
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [contractForm, setContractForm] = useState(initialContractForm);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingReleaseModule, setSavingReleaseModule] = useState(null);
  const [savingBranch, setSavingBranch] = useState(false);
  const [savingContract, setSavingContract] = useState(false);

  useEffect(() => {
    setCompanyForm(buildCompanyFormDraft(empresa));
  }, [empresa.id]);

  useEffect(() => {
    setPlanForm(buildPlanFormDraft(empresa));
  }, [empresa.id, empresa.planoComercial, empresa.statusAssinatura]);

  useEffect(() => {
    setReleaseDrafts(buildReleaseDrafts(liberationRows));
  }, [empresa.id, liberacoes.length]);

  function updateCompanyForm(field, value) {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePlanForm(field, value) {
    setPlanForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateReleaseDraft(modulo, field, value) {
    setReleaseDrafts((prev) => ({
      ...prev,
      [modulo]: {
        ...(prev[modulo] || { modulo }),
        modulo,
        [field]: value,
      },
    }));
  }

  function updateBranchForm(field, value) {
    setBranchForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateContractForm(field, value) {
    setContractForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCompanySubmit(event) {
    event.preventDefault();

    if (!companyForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome fantasia da empresa." });
      return;
    }

    setSavingCompany(true);
    setMessage(null);

    try {
      await endpoints.empresa.atualizarMinha(buildCompanyPayload(companyForm));
      setMessage({ type: "success", text: "Dados da empresa atualizados." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handlePlanSubmit(event) {
    event.preventDefault();
    setSavingPlan(true);
    setMessage(null);

    try {
      await endpoints.empresa.atualizarPlano(buildPlanPayload(planForm));
      setMessage({ type: "success", text: "Plano comercial atualizado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleReleaseSubmit(modulo) {
    const draft = releaseDrafts[modulo];
    if (!draft) {
      return;
    }

    setSavingReleaseModule(modulo);
    setMessage(null);

    try {
      await endpoints.empresa.atualizarLiberacao(draft);
      setMessage({ type: "success", text: "Liberação de módulo atualizada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingReleaseModule(null);
    }
  }

  async function handleBranchSubmit(event) {
    event.preventDefault();

    if (!branchForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da filial." });
      return;
    }

    setSavingBranch(true);
    setMessage(null);

    try {
      await endpoints.empresa.criarFilial(buildBranchPayload(branchForm));
      setBranchForm(initialBranchForm);
      setMessage({ type: "success", text: "Filial cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingBranch(false);
    }
  }

  async function handleContractSubmit(event) {
    event.preventDefault();

    if (!contractForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do contrato." });
      return;
    }

    setSavingContract(true);
    setMessage(null);

    try {
      await endpoints.empresa.criarContrato(buildContractPayload(contractForm));
      setContractForm(initialContractForm);
      setMessage({ type: "success", text: "Contrato cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingContract(false);
    }
  }

  return {
    branchForm,
    companyForm,
    contractForm,
    handleBranchSubmit,
    handleCompanySubmit,
    handleContractSubmit,
    handlePlanSubmit,
    handleReleaseSubmit,
    planForm,
    releaseDrafts,
    savingBranch,
    savingCompany,
    savingContract,
    savingPlan,
    savingReleaseModule,
    updateBranchForm,
    updateCompanyForm,
    updateContractForm,
    updatePlanForm,
    updateReleaseDraft,
  };
}
