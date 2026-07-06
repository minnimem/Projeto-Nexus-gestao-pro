import { normalizePerfil } from "../../../utils/permissions";
import {
  asList,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../../utils/formatters";
import {
  getCollaboratorDepartment,
  getCollaboratorHierarchyRole,
  getCollaboratorShift,
  getCollaboratorWorkStatus,
} from "../viewModels/collaboratorViewModel";
import { buildCollaboratorGovernanceViewModel } from "../viewModels/collaboratorGovernanceViewModel";

export function useCollaboratorsDashboardData({ branchFilter, data, profileFilter, search }) {
  const usuarios = asList(data.usuarios || data);
  const auditoria = asList(data.auditoria);
  const filiais = asList(data.filiais);
  const perfis = ["TODOS", ...Array.from(new Set(usuarios.map((usuario) => usuario.perfil).filter(Boolean)))];
  const normalizedSearch = search.trim().toLowerCase();
  const selectedBranchLabel = branchFilter === "TODAS" ?
    "Todas as filiais"
    : branchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === branchFilter)?.nome || "Filial";

  const filteredUsers = usuarios.filter((usuario) => {
    const matchesProfile = profileFilter === "TODOS" || usuario.perfil === profileFilter;
    const matchesBranch = branchFilter === "TODAS"
      || (branchFilter === "EMPRESA" ? !usuario.filialId : String(usuario.filialId || "") === branchFilter);
    const searchable = [
      usuario.nome,
      usuario.login,
      usuario.perfil,
      usuario.filial,
      usuario.cargo,
      usuario.departamento,
      usuario.telefone,
      usuario.email,
      usuario.empresa,
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesProfile && matchesBranch && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
  const ativos = filteredUsers.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length;
  const bloqueados = filteredUsers.filter((usuario) => usuario.bloqueado).length;
  const gerentes = filteredUsers.filter((usuario) => usuario.perfil === "GERENTE").length;
  const semFilial = usuarios.filter((usuario) => usuario.perfil !== "ADMIN" && !usuario.filialId).length;
  const branchRows = [
    {
      id: "EMPRESA",
      nome: "Empresa / sem filial",
      total: usuarios.filter((usuario) => !usuario.filialId).length,
      ativos: usuarios.filter((usuario) => !usuario.filialId && usuario.ativo !== false && !usuario.bloqueado).length,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      total: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id)).length,
      ativos: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id) && usuario.ativo !== false && !usuario.bloqueado).length,
    })),
  ];
  const activeUsers = usuarios.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado);
  const userBranchKey = (usuario) => String(usuario.filialId || "EMPRESA");
  const getUserBranchLabel = (usuario) => usuario.filial
    || filiais.find((filial) => String(filial.id) === String(usuario.filialId)).nome
    || "Empresa / sem filial";
  const branchCoverage = branchRows.map((row) => {
    const branchUsers = usuarios.filter((usuario) => userBranchKey(usuario) === String(row.id));
    const activeBranchUsers = branchUsers.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado);
    const profileCount = (profiles) => activeBranchUsers.filter((usuario) => profiles.includes(normalizePerfil(usuario.perfil))).length;
    const gestores = profileCount(["ADMIN", "GERENTE"]);
    const vendedores = profileCount(["VENDEDOR", "GERENTE"]);
    const caixa = profileCount(["OPERADOR_CAIXA"]);
    const estoque = profileCount(["ESTOQUISTA"]);
    const financeiro = profileCount(["FINANCEIRO", "ADMIN"]);
    const gaps = [
      gestores === 0 && "gestor",
      vendedores === 0 && "vendas",
      caixa === 0 && "caixa",
      estoque === 0 && "estoque",
      financeiro === 0 && "financeiro",
    ].filter(Boolean);

    return {
      ...row,
      gestores,
      vendedores,
      caixa,
      estoque,
      financeiro,
      semCargo: branchUsers.filter((usuario) => !usuario.cargo).length,
      bloqueados: branchUsers.filter((usuario) => usuario.bloqueado || usuario.ativo === false).length,
      gaps,
      coverageScore: Math.round(((5 - gaps.length) / 5) * 100),
    };
  });
  const coverageRows = branchCoverage.map((row) => ({
    Filial: row.nome,
    Colaboradores: formatNumber(row.total),
    Ativos: formatNumber(row.ativos),
    Gestores: formatNumber(row.gestores),
    Vendas: formatNumber(row.vendedores),
    Caixa: formatNumber(row.caixa),
    Estoque: formatNumber(row.estoque),
    Financeiro: formatNumber(row.financeiro),
    "Cobertura operacional": `${formatPercent(row.coverageScore)}%`,
    Pendencias: row.gaps.length > 0 ? row.gaps.join(", ") : "Sem lacunas principais",
  }));
  const organizationGroups = Array.from(
    activeUsers.reduce((map, usuario) => {
      const key = `${userBranchKey(usuario)}-${normalizePerfil(usuario.perfil)}-${usuario.cargo || "Sem cargo"}`;
      const current = map.get(key) || {
        key,
        filial: getUserBranchLabel(usuario),
        perfil: normalizePerfil(usuario.perfil) || "SEM PERFIL",
        cargo: usuario.cargo || "Sem cargo",
        total: 0,
        nomes: [],
      };
      current.total += 1;
      current.nomes.push(usuario.nome || usuario.login || "Colaborador");
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => a.filial.localeCompare(b.filial) || b.total - a.total);
  const organizationRows = organizationGroups.map((group) => ({
    Filial: group.filial,
    Perfil: group.perfil,
    Cargo: group.cargo,
    Colaboradores: formatNumber(group.total),
    Pessoas: group.nomes.slice(0, 5).join(", "),
  }));
  const hierarchyGroups = Array.from(
    activeUsers.reduce((map, usuario) => {
      const key = `${userBranchKey(usuario)}-${getCollaboratorDepartment(usuario)}`;
      const current = map.get(key) || {
        key,
        filial: getUserBranchLabel(usuario),
        setor: getCollaboratorDepartment(usuario),
        lideres: [],
        supervisores: [],
        equipe: [],
      };
      const role = getCollaboratorHierarchyRole(usuario);
      const label = usuario.nome || usuario.login || "Colaborador";
      if (role === "LIDER") current.lideres.push(label);
      else if (role === "SUPERVISOR") current.supervisores.push(label);
      else current.equipe.push(label);
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => a.filial.localeCompare(b.filial) || a.setor.localeCompare(b.setor));
  const hierarchyRows = hierarchyGroups.map((group) => ({
    Filial: group.filial,
    Setor: group.setor,
    Lider: group.lideres.join(", ") || "Sem lider definido",
    Supervisores: group.supervisores.join(", ") || "Sem supervisor definido",
    Subordinados: group.equipe.join(", ") || "-",
    Total: formatNumber(group.lideres.length + group.supervisores.length + group.equipe.length),
  }));
  const collaboratorRiskPlan = [
    semFilial > 0 && {
      key: "without-branch",
      severity: "warning",
      title: "Colaboradores sem filial",
      detail: `${formatNumber(semFilial)} usuario(s) operacional(is) precisam ser vinculados a uma loja.`,
    },
    branchCoverage.some((row) => row.gestores === 0 && row.id !== "EMPRESA") && {
      key: "without-manager",
      severity: "danger",
      title: "Filiais sem gestor",
      detail: "Uma ou mais filiais não possuem ADMIN/GERENTE ativo para supervisão operacional.",
    },
    usuarios.some((usuario) => !usuario.cargo) && {
      key: "without-role",
      severity: "info",
      title: "Cargos incompletos",
      detail: `${formatNumber(usuarios.filter((usuario) => !usuario.cargo).length)} colaborador(es) sem cargo informado.`,
    },
    usuarios.some((usuario) => usuario.bloqueado || usuario.ativo === false) && {
      key: "blocked-users",
      severity: "warning",
      title: "Acessos bloqueados ou inativos",
      detail: `${formatNumber(usuarios.filter((usuario) => usuario.bloqueado || usuario.ativo === false).length)} conta(s) devem ser revisadas para evitar usuario fantasma.`,
    },
  ].filter(Boolean);
  const roleGoalCards = [
    {
      key: "vendedor",
      label: "Vendedores",
      profile: "VENDEDOR",
      target: "Meta comercial",
      active: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "VENDEDOR"),
      value: activeUsers
        .filter((usuario) => normalizePerfil(usuario.perfil) === "VENDEDOR")
        .reduce((total, usuario) => total + Number(usuario.metaVendas || 0), 0),
      formatter: formatCurrency,
    },
    {
      key: "financeiro",
      label: "Financeiro",
      profile: "FINANCEIRO",
      target: "Cobertura financeira",
      active: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "FINANCEIRO"),
      value: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "FINANCEIRO").length,
      formatter: formatNumber,
    },
    {
      key: "entregador",
      label: "Entregadores",
      profile: "ENTREGADOR",
      target: "Cobertura de campo",
      active: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "ENTREGADOR"),
      value: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "ENTREGADOR").length,
      formatter: formatNumber,
    },
    {
      key: "estoquista",
      label: "Estoquistas",
      profile: "ESTOQUISTA",
      target: "Cobertura de estoque",
      active: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "ESTOQUISTA"),
      value: activeUsers.filter((usuario) => normalizePerfil(usuario.perfil) === "ESTOQUISTA").length,
      formatter: formatNumber,
    },
  ].map((card) => ({
    ...card,
    tone: card.active.length === 0 ? "danger" : card.key === "vendedor" && card.value <= 0 ? "warning" : "success",
    people: card.active.map((usuario) => usuario.nome || usuario.login || "Colaborador"),
  }));
  const roleGoalRows = roleGoalCards.map((card) => ({
    Perfil: card.label,
    Indicador: card.target,
    Valor: card.formatter(card.value),
    Colaboradores: formatNumber(card.active.length),
    Pessoas: card.people.slice(0, 6).join(", ") || "Sem colaborador ativo",
    Status: card.tone === "success" ? "Ok" : card.tone === "warning" ? "Definir meta" : "Sem cobertura",
  }));
  const workStatusCards = [
    { key: "ATIVO", label: "Ativos", tone: "success" },
    { key: "FERIAS", label: "Ferias", tone: "warning" },
    { key: "AFASTADO", label: "Afastados", tone: "warning" },
    { key: "DESLIGADO", label: "Desligados", tone: "danger" },
    { key: "INATIVO", label: "Inativos", tone: "danger" },
  ].map((card) => {
    const items = usuarios.filter((usuario) => getCollaboratorWorkStatus(usuario).key === card.key);
    return {
      ...card,
      items,
      people: items.map((usuario) => usuario.nome || usuario.login || "Colaborador"),
    };
  });
  const shiftSummary = Array.from(
    usuarios.reduce((map, usuario) => {
      const shift = getCollaboratorShift(usuario);
      const current = map.get(shift) || { shift, total: 0, ativos: 0, profiles: new Set() };
      current.total += 1;
      current.ativos += getCollaboratorWorkStatus(usuario).key === "ATIVO" ? 1 : 0;
      current.profiles.add(normalizePerfil(usuario.perfil) || "SEM PERFIL");
      map.set(shift, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const workScheduleRows = [
    ...workStatusCards.map((card) => ({
      Tipo: "Status",
      Grupo: card.label,
      Total: formatNumber(card.items.length),
      Ativos: card.key === "ATIVO" ? formatNumber(card.items.length) : "-",
      Perfis: "-",
      Pessoas: card.people.slice(0, 8).join(", ") || "Sem registros",
    })),
    ...shiftSummary.map((row) => ({
      Tipo: "Turno/Jornada",
      Grupo: row.shift,
      Total: formatNumber(row.total),
      Ativos: formatNumber(row.ativos),
      Perfis: Array.from(row.profiles).join(", "),
      Pessoas: "-",
    })),
  ];
  const {
    collaboratorAuditRows,
    collaboratorIssueExportRows,
    collaboratorIssueRows,
    criticalCollaboratorIssues,
    permissionCoverageCards,
    permissionCoverageRows,
    permissionProfileRows,
    recentSensitiveAudit,
    userAuditSummary,
    usersWithoutAudit,
    warningCollaboratorIssues,
  } = buildCollaboratorGovernanceViewModel({
    auditoria,
    filteredUsers,
    getUserBranchLabel,
    usuarios,
  });

  return {
    ativos,
    auditoria,
    branchCoverage,
    branchRows,
    collaboratorAuditRows,
    collaboratorIssueExportRows,
    collaboratorIssueRows,
    collaboratorRiskPlan,
    coverageRows,
    criticalCollaboratorIssues,
    filiais,
    filteredUsers,
    gerentes,
    getUserBranchLabel,
    hierarchyGroups,
    hierarchyRows,
    organizationGroups,
    organizationRows,
    perfis,
    permissionCoverageCards,
    permissionCoverageRows,
    permissionProfileRows,
    recentSensitiveAudit,
    roleGoalCards,
    roleGoalRows,
    selectedBranchLabel,
    semFilial,
    shiftSummary,
    userAuditSummary,
    usersWithoutAudit,
    usuarios,
    warningCollaboratorIssues,
    workScheduleRows,
    workStatusCards,
  };
}
