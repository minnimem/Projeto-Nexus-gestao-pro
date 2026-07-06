import { modules } from "../../../constants/modules";
import {
  criticalPermissions,
  permissionProfiles,
} from "../constants/permissionGovernance";
import { PermissionGovernanceSections } from "./PermissionGovernanceSections";

export function GovernancePermissionsContainer({ dashboard, session }) {
  return (
    <PermissionGovernanceSections
      criticalAuditEvents={dashboard.criticalAuditEvents}
      criticalPermissions={criticalPermissions}
      manualPermissionRows={dashboard.manualPermissionRows}
      modulePermissionRows={dashboard.modulePermissionRows}
      modules={modules}
      permissionGovernancePlan={dashboard.permissionGovernancePlan}
      permissionMatrixRows={dashboard.permissionMatrixRows}
      permissionProfiles={permissionProfiles}
      sensitiveHardeningRows={dashboard.sensitiveHardeningRows}
      sensitivePermissionCards={dashboard.sensitivePermissionCards}
      sensitivePermissionHardening={dashboard.sensitivePermissionHardening}
      sensitivePermissionRows={dashboard.sensitivePermissionRows}
      session={session}
      usersWithManualPermissions={dashboard.usersWithManualPermissions}
      usuariosSemFilial={dashboard.usuariosSemFilial}
    />
  );
}
