import { AccessGovernanceSection } from "./AccessGovernanceSection";
import { AccessHardeningSection } from "./AccessHardeningSection";
import { PermissionMatrixSection } from "./PermissionMatrixSection";
import { SensitivePermissionsSection } from "./SensitivePermissionsSection";

export function PermissionGovernanceSections({
  criticalAuditEvents,
  criticalPermissions,
  manualPermissionRows,
  modulePermissionRows,
  modules,
  permissionGovernancePlan,
  permissionMatrixRows,
  permissionProfiles,
  sensitiveHardeningRows,
  sensitivePermissionCards,
  sensitivePermissionHardening,
  sensitivePermissionRows,
  session,
  usersWithManualPermissions,
  usuariosSemFilial,
}) {
  return (
    <>
      <PermissionMatrixSection
        criticalPermissions={criticalPermissions}
        modulePermissionRows={modulePermissionRows}
        modules={modules}
        permissionMatrixRows={permissionMatrixRows}
        permissionProfiles={permissionProfiles}
        session={session}
      />

      <SensitivePermissionsSection
        sensitivePermissionCards={sensitivePermissionCards}
        sensitivePermissionRows={sensitivePermissionRows}
        session={session}
      />

      <AccessHardeningSection
        sensitiveHardeningRows={sensitiveHardeningRows}
        sensitivePermissionHardening={sensitivePermissionHardening}
        session={session}
      />

      <AccessGovernanceSection
        criticalAuditEvents={criticalAuditEvents}
        manualPermissionRows={manualPermissionRows}
        permissionGovernancePlan={permissionGovernancePlan}
        session={session}
        usersWithManualPermissions={usersWithManualPermissions}
        usuariosSemFilial={usuariosSemFilial}
      />
    </>
  );
}
