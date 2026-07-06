import { permissionProfiles } from "../constants/permissionGovernance";
import { UserDashboardKpis } from "./UserDashboardSummary";
import { UserOperationalFilterPanel } from "./UserOperationalFilterPanel";

export function UserDashboardOverview({ dashboard }) {
  return (
    <>
      <UserDashboardKpis
        activeFiscalConfigs={dashboard.activeFiscalConfigs}
        admins={dashboard.admins}
        ativos={dashboard.ativos}
        bloqueados={dashboard.bloqueados}
        contratos={dashboard.contratos}
        filteredUsers={dashboard.filteredUsers}
        fiscalReadinessRows={dashboard.fiscalReadinessRows}
        fiscalReadyCount={dashboard.fiscalReadyCount}
        selectedUserBranchLabel={dashboard.selectedUserBranchLabel}
        usuariosSemFilial={dashboard.usuariosSemFilial}
      />

      <UserOperationalFilterPanel
        filiais={dashboard.filiais}
        permissionProfiles={permissionProfiles}
        setUserBranchFilter={dashboard.setUserBranchFilter}
        setUserProfileFilter={dashboard.setUserProfileFilter}
        userBranchFilter={dashboard.userBranchFilter}
        userBranchRows={dashboard.userBranchRows}
        userProfileFilter={dashboard.userProfileFilter}
      />
    </>
  );
}
