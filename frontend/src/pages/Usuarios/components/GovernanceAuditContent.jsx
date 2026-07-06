import { GovernanceAuditTrailContainer } from "./GovernanceAuditTrailContainer";
import { GovernancePermissionsContainer } from "./GovernancePermissionsContainer";
import { GovernanceUsersContainer } from "./GovernanceUsersContainer";

export function GovernanceAuditContent({
  dashboard,
  isPrivilegedPerfil,
  session,
  userOps,
}) {
  return (
    <>
      <GovernancePermissionsContainer dashboard={dashboard} session={session} />
      <GovernanceAuditTrailContainer dashboard={dashboard} session={session} />
      <GovernanceUsersContainer
        dashboard={dashboard}
        isPrivilegedPerfil={isPrivilegedPerfil}
        userOps={userOps}
      />
    </>
  );
}
