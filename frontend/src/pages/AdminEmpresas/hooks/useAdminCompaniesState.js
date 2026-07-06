import { useEffect, useState } from "react";
import {
  initialCompanyForm,
  initialMasterCompanyForm,
  initialPlanForm,
  liberationModules,
} from "../../../constants/admin.js";
import { asList } from "../../../utils/formatters.js";

export function useAdminCompaniesState({ data, selectedCompanyId }) {
  const empresas = asList(data.empresas || data);
  const selectedCompany = empresas.find((empresa) => String(empresa.id) === String(selectedCompanyId)) || empresas[0] || null;
  const selectedLiberations = asList(selectedCompany.liberacoes);
  const commercialHistory = asList(selectedCompany.historicoComercial);
  const selectedLiberationRows = liberationModules.map((module) => {
    const release = selectedLiberations.find((item) => item.modulo === module.modulo) || {};
    return {
      ...module,
      ...release,
      status: release.status || "BLOQUEADO",
      contratado: Boolean(release.contratado),
      liberado: Boolean(release.liberado),
      liberadoPorPlano: Boolean(release.liberadoPorPlano),
    };
  });
  const [companyForm, setCompanyForm] = useState(initialMasterCompanyForm);
  const [editCompanyForm, setEditCompanyForm] = useState(initialCompanyForm);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [planDraft, setPlanDraft] = useState(initialPlanForm);
  const [planObservation, setPlanObservation] = useState("");
  const [statusObservation, setStatusObservation] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [companyPlanFilter, setCompanyPlanFilter] = useState("TODOS");
  const [companyStatusFilter, setCompanyStatusFilter] = useState("TODOS");
  const [releaseDrafts, setReleaseDrafts] = useState({});
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingCompanyEdit, setSavingCompanyEdit] = useState(false);
  const [savingCompanyStatus, setSavingCompanyStatus] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingReleaseModule, setSavingReleaseModule] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!selectedCompany) {
      setPlanDraft(initialPlanForm);
      setEditCompanyForm(initialCompanyForm);
      setReleaseDrafts({});
      return;
    }

    setEditCompanyForm({
      nome: selectedCompany.nome || "",
      razaoSocial: selectedCompany.razaoSocial || "",
      cnpj: selectedCompany.cnpj || "",
      telefone: selectedCompany.telefone || "",
      email: selectedCompany.email || "",
      endereco: selectedCompany.endereco || "",
      cidade: selectedCompany.cidade || "",
      uf: selectedCompany.uf || "",
      cep: selectedCompany.cep || "",
      codigoMunicipio: selectedCompany.codigoMunicipio || "",
      inscricaoEstadual: selectedCompany.inscricaoEstadual || "",
      inscricaoMunicipal: selectedCompany.inscricaoMunicipal || "",
      regimeTributario: selectedCompany.regimeTributario || "",
      crt: selectedCompany.crt || "",
      estoqueMinimoPadrao: selectedCompany.estoqueMinimoPadrao || 5,
    });

    setPlanDraft({
      planoComercial: selectedCompany.planoComercial || "STARTER",
      statusAssinatura: selectedCompany.statusAssinatura || "TESTE",
      limiteUsuarios: selectedCompany.limiteUsuarios ?? selectedCompany.plano?.limites?.usuarios ?? 3,
      limiteFiliais: selectedCompany.limiteFiliais ?? selectedCompany.plano?.limites?.filiais ?? 1,
      limiteCaixas: selectedCompany.limiteCaixas ?? selectedCompany.plano?.limites?.caixas ?? 1,
      limiteProdutos: selectedCompany.limiteProdutos ?? selectedCompany.plano?.limites?.produtos ?? 500,
      valorMensalPlano: selectedCompany.valorMensalPlano ?? selectedCompany.plano?.valorMensalPlano ?? "",
      diaVencimentoPlano: selectedCompany.diaVencimentoPlano ?? selectedCompany.plano?.diaVencimentoPlano ?? 10,
      ultimoPagamentoPlano: selectedCompany.ultimoPagamentoPlano ?? selectedCompany.plano?.ultimoPagamentoPlano ?? "",
      fiscalLiberado: Boolean(selectedCompany.fiscalLiberado),
      pagamentosLiberado: Boolean(selectedCompany.pagamentosLiberado),
      notificacoesLiberado: Boolean(selectedCompany.notificacoesLiberado),
      logisticaLiberada: Boolean(selectedCompany.logisticaLiberada),
      servicosLiberado: Boolean(selectedCompany.servicosLiberado),
      auditoriaAvancadaLiberada: Boolean(selectedCompany.auditoriaAvancadaLiberada),
    });
    setPlanObservation("");
    setStatusObservation("");

    const nextDrafts = {};
    selectedLiberationRows.forEach((row) => {
      nextDrafts[row.modulo] = {
        modulo: row.modulo,
        status: row.status || "BLOQUEADO",
        contratado: Boolean(row.contratado),
        responsavel: row.responsavel || "",
        evidencia: row.evidencia || row["evidencia"] || "",
        observacao: row.observacao || "",
      };
    });
    setReleaseDrafts(nextDrafts);
  }, [selectedCompany.id]);

  return {
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
  };
}
