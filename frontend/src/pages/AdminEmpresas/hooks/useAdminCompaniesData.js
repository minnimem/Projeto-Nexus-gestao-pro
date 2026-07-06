import {
  formatDateTime,
  formatNumber,
} from "../../../utils/formatters.js";
import { getCompanyRiskSignals } from "../viewModels/adminCompanyViewModel.js";

export function useAdminCompaniesData({
  companyPlanFilter,
  companySearch,
  companyStatusFilter,
  commercialHistory,
  empresas,
}) {
  const activeCompanies = empresas.filter((empresa) => empresa.ativo !== false).length;
  const enterpriseCompanies = empresas.filter((empresa) => empresa.planoComercial === "ENTERPRISE").length;
  const suspendedCompanies = empresas.filter((empresa) => ["SUSPENSA", "CANCELADA"].includes(String(empresa.statusAssinatura || ""))).length;
  const totalActiveUsers = empresas.reduce((total, empresa) => total + Number(empresa.usuariosAtivos || 0), 0);
  const companiesWithRisk = empresas.filter((empresa) =>
    getCompanyRiskSignals(empresa).some((signal) => ["danger", "warning"].includes(signal.tone))
  ).length;
  const normalizedCompanySearch = companySearch.trim().toLowerCase();
  const filteredCompanies = empresas.filter((empresa) => {
    const haystack = [
      empresa.nome,
      empresa.razaoSocial,
      empresa.cnpj,
      empresa.email,
      empresa.cidade,
      empresa.uf,
    ].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !normalizedCompanySearch || haystack.includes(normalizedCompanySearch);
    const matchesPlan = companyPlanFilter === "TODOS" || empresa.planoComercial === companyPlanFilter;
    const assinatura = String(empresa.statusAssinatura || "TESTE").toUpperCase();
    const operationalStatus = empresa.ativo === false ? "INATIVA" : assinatura;
    const matchesStatus = companyStatusFilter === "TODOS" || operationalStatus === companyStatusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });
  const companyRows = filteredCompanies.map((empresa) => ({
    Empresa: empresa.nome || "-",
    Plano: empresa.planoComercial || "-",
    Assinatura: empresa.statusAssinatura || "-",
    Usuarios: formatNumber(empresa.usuariosAtivos || 0),
    Filiais: formatNumber(empresa.filiais || 0),
    Cidade: [empresa.cidade, empresa.uf].filter(Boolean).join("/") || "-",
    Status: empresa.ativo === false ? "Inativa" : "Ativa",
    Risco: getCompanyRiskSignals(empresa).map((signal) => signal.label).join(", "),
  }));
  const commercialHistoryRows = commercialHistory.map((evento) => ({
    Data: evento.dataEvento ? formatDateTime(evento.dataEvento) : "-",
    Usuario: evento.usuarioLogin || "-",
    Perfil: evento.perfil || "-",
    Modulo: evento.modulo || "-",
    Acao: evento.acao || "-",
    "Descricao": evento.descricao || "-",
  }));

  return {
    activeCompanies,
    commercialHistoryRows,
    companiesWithRisk,
    companyRows,
    enterpriseCompanies,
    filteredCompanies,
    suspendedCompanies,
    totalActiveUsers,
  };
}
