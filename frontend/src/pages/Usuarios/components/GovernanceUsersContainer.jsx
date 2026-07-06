import {
  editableProfiles,
  userPermissionActions,
  userPermissionModules,
} from "../../../constants/admin";
import {
  actionPermissionKey,
  modulePermissionKey,
} from "../../../utils/permissions";
import { UsersPermissionsSection } from "./UsersPermissionsSection";

export function GovernanceUsersContainer({ dashboard, isPrivilegedPerfil, userOps }) {
  return (
    <UsersPermissionsSection
      actionPermissionKey={actionPermissionKey}
      closePermissionEditor={userOps.closePermissionEditor}
      editableProfiles={editableProfiles}
      filteredUsers={dashboard.filteredUsers}
      handleAccessChange={userOps.handleAccessChange}
      handlePermissionSave={userOps.handlePermissionSave}
      handleProfileChange={userOps.handleProfileChange}
      isPrivilegedPerfil={isPrivilegedPerfil}
      modulePermissionKey={modulePermissionKey}
      openCreateUserForm={userOps.openCreateUserForm}
      openEditUserForm={userOps.openEditUserForm}
      openPermissionEditor={userOps.openPermissionEditor}
      permissionDraft={userOps.permissionDraft}
      savingAccessId={userOps.savingAccessId}
      savingPermissionId={userOps.savingPermissionId}
      savingProfileId={userOps.savingProfileId}
      selectedPermissionUser={userOps.selectedPermissionUser}
      updatePermissionDraft={userOps.updatePermissionDraft}
      userPermissionActions={userPermissionActions}
      userPermissionModules={userPermissionModules}
      usuarios={dashboard.usuarios}
    />
  );
}
