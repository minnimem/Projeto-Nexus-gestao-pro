import { UserFormModal } from "./UserFormModal";

export function UserFormModalHost({ dashboard, message, userOps }) {
  if (!userOps.showUserForm) {
    return null;
  }

  return (
    <UserFormModal
      closeUserForm={userOps.closeUserForm}
      editingUser={userOps.editingUser}
      filiais={dashboard.filiais}
      form={userOps.form}
      handleSubmit={userOps.handleSubmit}
      message={message}
      saving={userOps.saving}
      updateForm={userOps.updateForm}
    />
  );
}
