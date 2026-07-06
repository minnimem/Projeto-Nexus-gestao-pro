import { useState } from "react";
import { userPermissionActions, userPermissionModules } from "../../constants/admin";
import { canAccessModule, canPerform, normalizePerfil } from "../../utils/permissions";
import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "../../utils/formatters";
import { BranchCoveragePanel } from "./components/BranchCoveragePanel";
import { AuditRhPanel } from "./components/AuditRhPanel";
import { CollaboratorIssuesPanel } from "./components/CollaboratorIssuesPanel";
import { CollaboratorsKpiPanel } from "./components/CollaboratorsKpiPanel";
import { CollaboratorsTable } from "./components/CollaboratorsTable";
import { HierarchyPanel } from "./components/HierarchyPanel";
import { OperationalFilterPanel } from "./components/OperationalFilterPanel";
import { OrganizationPanel } from "./components/OrganizationPanel";
import { PermissionsOperationsPanel } from "./components/PermissionsOperationsPanel";
import { RhRiskPlanPanel } from "./components/RhRiskPlanPanel";
import { RoleGoalsPanel } from "./components/RoleGoalsPanel";
import { WorkSchedulePanel } from "./components/WorkSchedulePanel";
import {
  getCollaboratorAccessTone,
  getCollaboratorAvatarUrl,
  getCollaboratorDepartment,
  getCollaboratorHierarchyRole,
  getCollaboratorInitials,
  getCollaboratorShift,
  getCollaboratorWorkStatus,
} from "./viewModels/collaboratorViewModel";
import "./Colaboradores.css";


export function Colaboradores({ data }) {
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("TODOS");
  const [branchFilter, setBranchFilter] = useState("TODAS");
  const {
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
  } = useCollaboratorsDashboardData({
    branchFilter,
    data,
    profileFilter,
    search,
  });
  return (
    <div className="dashboard-view">
      <CollaboratorsKpiPanel
        ativos={ativos}
        filteredUsers={filteredUsers}
        gerentes={gerentes}
        selectedBranchLabel={selectedBranchLabel}
        semFilial={semFilial}
      />

      <RhRiskPlanPanel collaboratorRiskPlan={collaboratorRiskPlan} />

      <CollaboratorIssuesPanel
        collaboratorIssueExportRows={collaboratorIssueExportRows}
        collaboratorIssueRows={collaboratorIssueRows}
        criticalCollaboratorIssues={criticalCollaboratorIssues}
        getUserBranchLabel={getUserBranchLabel}
        warningCollaboratorIssues={warningCollaboratorIssues}
      />
      <RoleGoalsPanel
        roleGoalCards={roleGoalCards}
        roleGoalRows={roleGoalRows}
      />

      <WorkSchedulePanel
        shiftSummary={shiftSummary}
        workScheduleRows={workScheduleRows}
        workStatusCards={workStatusCards}
      />

      <PermissionsOperationsPanel
        permissionCoverageCards={permissionCoverageCards}
        permissionCoverageRows={permissionCoverageRows}
        permissionProfileRows={permissionProfileRows}
      />

      <AuditRhPanel
        auditoria={auditoria}
        collaboratorAuditRows={collaboratorAuditRows}
        recentSensitiveAudit={recentSensitiveAudit}
        userAuditSummary={userAuditSummary}
        usersWithoutAudit={usersWithoutAudit}
      />

      <BranchCoveragePanel
        branchCoverage={branchCoverage}
        coverageRows={coverageRows}
      />

      <OrganizationPanel
        organizationGroups={organizationGroups}
        organizationRows={organizationRows}
      />

      <HierarchyPanel
        hierarchyGroups={hierarchyGroups}
        hierarchyRows={hierarchyRows}
      />

      <OperationalFilterPanel
        branchFilter={branchFilter}
        branchRows={branchRows}
        filiais={filiais}
        perfis={perfis}
        profileFilter={profileFilter}
        setBranchFilter={setBranchFilter}
        setProfileFilter={setProfileFilter}
      />
      <CollaboratorsTable
        filteredUsers={filteredUsers}
        getCollaboratorAccessTone={getCollaboratorAccessTone}
        getCollaboratorAvatarUrl={getCollaboratorAvatarUrl}
        getCollaboratorInitials={getCollaboratorInitials}
        getCollaboratorShift={getCollaboratorShift}
        getCollaboratorWorkStatus={getCollaboratorWorkStatus}
        search={search}
        setSearch={setSearch}
        usuarios={usuarios}
      />
    </div>
  );
}
