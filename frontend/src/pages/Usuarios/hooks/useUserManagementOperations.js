import { useState } from "react";
import { initialUserForm } from "../../../constants/admin";
import { endpoints } from "../../../services/resources";
import { buildPermissionDraft } from "../utils/permissionDraft";
import { buildUserFormDraft } from "../utils/formDrafts";
import { buildUserPayload } from "../utils/userPayload";

export function useUserManagementOperations({ onRefresh, setMessage }) {
  const [form, setForm] = useState(initialUserForm);
  const [saving, setSaving] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState(null);
  const [savingAccessId, setSavingAccessId] = useState(null);
  const [savingPermissionId, setSavingPermissionId] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPermissionUser, setSelectedPermissionUser] = useState(null);
  const [permissionDraft, setPermissionDraft] = useState({});

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateUserForm() {
    setForm(initialUserForm);
    setEditingUser(null);
    setMessage(null);
    setShowUserForm(true);
  }

  function openEditUserForm(usuario) {
    setForm(buildUserFormDraft(usuario));
    setEditingUser(usuario);
    setMessage(null);
    setShowUserForm(true);
  }

  function closeUserForm() {
    setShowUserForm(false);
    setEditingUser(null);
    setForm(initialUserForm);
  }

  function openPermissionEditor(usuario) {
    setSelectedPermissionUser(usuario);
    setPermissionDraft(buildPermissionDraft(usuario));
    setMessage(null);
  }

  function closePermissionEditor() {
    setSelectedPermissionUser(null);
    setPermissionDraft({});
  }

  function updatePermissionDraft(permissionKey, value) {
    setPermissionDraft((current) => ({ ...current, [permissionKey]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isEditing = Boolean(editingUser.id);

    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do usuário." });
      return;
    }

    if (!form.login.trim()) {
      setMessage({ type: "error", text: "Informe o login do usuário." });
      return;
    }

    if (!isEditing && form.senha.length < 6) {
      setMessage({ type: "error", text: "Senha precisa ter no mínimo 6 caracteres." });
      return;
    }

    if (isEditing && form.senha && form.senha.length < 6) {
      setMessage({ type: "error", text: "Nova senha precisa ter no mínimo 6 caracteres." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (isEditing) {
        await endpoints.usuarios.atualizar(editingUser.id, buildUserPayload(form, false));
      } else {
        await endpoints.usuarios.criar(buildUserPayload(form, true));
      }

      setForm(initialUserForm);
      setEditingUser(null);
      setShowUserForm(false);
      setMessage({
        type: "success",
        text: isEditing ? "Colaborador atualizado com sucesso." : "Colaborador cadastrado na empresa atual.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileChange(usuario, perfil) {
    if (!usuario.id || !perfil || perfil === usuario.perfil) {
      return;
    }

    setSavingProfileId(usuario.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarPerfil(usuario.id, perfil);
      setMessage({ type: "success", text: `Perfil de ${usuario.nome || usuario.login} atualizado.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingProfileId(null);
    }
  }

  async function handleAccessChange(usuario, ativo) {
    setSavingAccessId(usuario.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarAcesso(usuario.id, ativo);
      setMessage({
        type: "success",
        text: ativo ? "Acesso concedido ao usuário." : "Acesso revogado do usuário.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingAccessId(null);
    }
  }

  async function handlePermissionSave() {
    if (!selectedPermissionUser.id) return;

    const permissoesExtras = Object.entries(permissionDraft)
      .filter(([, value]) => value === "LIBERAR")
      .map(([key]) => key);
    const permissoesBloqueadas = Object.entries(permissionDraft)
      .filter(([, value]) => value === "BLOQUEAR")
      .map(([key]) => key);

    setSavingPermissionId(selectedPermissionUser.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarPermissoes(selectedPermissionUser.id, {
        permissoesExtras,
        permissoesBloqueadas,
      });
      setMessage({
        type: "success",
        text: "Permissões manuais atualizadas. O usuário passa a usar as novas regras no próximo login.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingPermissionId(null);
    }
  }

  return {
    closePermissionEditor,
    closeUserForm,
    editingUser,
    form,
    handleAccessChange,
    handlePermissionSave,
    handleProfileChange,
    handleSubmit,
    openCreateUserForm,
    openEditUserForm,
    openPermissionEditor,
    permissionDraft,
    saving,
    savingAccessId,
    savingPermissionId,
    savingProfileId,
    selectedPermissionUser,
    showUserForm,
    updateForm,
    updatePermissionDraft,
  };
}
