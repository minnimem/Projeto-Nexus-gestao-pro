import { useEffect, useState } from "react";
import { canPerform } from "../../../utils/permissions";
import { asList, formatNumber } from "../../../utils/formatters";
import { buildAuditGovernance } from "../utils/auditGovernanceViewModel";
import { buildCompanyOperationsViewModel } from "../utils/companyOperationsViewModel";
import { buildModuleLiberationRows } from "../utils/moduleLiberationViewModel";
import { buildSensitivePermissionGovernance } from "../utils/permissionGovernanceViewModel";
import { buildUserAccessViewModel } from "../utils/userAccessViewModel";

export function useUsuariosDashboardData({ data, session }) {
  const [userBranchFilter, setUserBranchFilter] = useState("TODAS");
  const [userProfileFilter, setUserProfileFilter] = useState("TODOS");
  const [auditFilter, setAuditFilter] = useState({
    busca: "",
    modulo: "TODOS",
    acao: "TODOS",
    inicio: "",
    fim: "",
  });
  const [auditPage, setAuditPage] = useState(0);

  const usuarios = asList(data.usuarios || data);
  const auditoria = asList(data.auditoria);
  const empresa = data.empresa || {};
  const filiais = asList(data.filiais);
  const contratos = asList(data.contratos);
  const configuracoesFiscais = asList(data.configuracoesFiscais);
  const liberacoes = asList(data.liberacoes);
  const masterEmpresas = asList(data.masterEmpresas);
  const selectedCompany = empresa;
  const empresaId = empresa.id || session.empresaId;
  const canManagePlans = canPerform(session, "managePlans");
  const liberationRows = buildModuleLiberationRows(liberacoes);

  const sensitivePermissionGovernance = buildSensitivePermissionGovernance(usuarios, formatNumber);
  const auditGovernance = buildAuditGovernance(auditoria, usuarios, auditFilter, auditPage);
  const userAccess = buildUserAccessViewModel({
    usuarios,
    filiais,
    userBranchFilter,
    userProfileFilter,
    criticalAuditEventsCount: auditGovernance.criticalAuditEvents.length,
  });
  const companyOperations = buildCompanyOperationsViewModel(empresa, filiais, contratos, configuracoesFiscais);

  useEffect(() => {
    setAuditPage(0);
  }, [auditFilter]);

  return {
    ...auditGovernance,
    ...companyOperations,
    ...sensitivePermissionGovernance,
    ...userAccess,
    auditFilter,
    canManagePlans,
    configuracoesFiscais,
    contratos,
    empresa,
    empresaId,
    filiais,
    liberacoes,
    liberationRows,
    masterEmpresas,
    selectedCompany,
    setAuditFilter,
    setAuditPage,
    setUserBranchFilter,
    setUserProfileFilter,
    userBranchFilter,
    userProfileFilter,
    usuarios,
  };
}
