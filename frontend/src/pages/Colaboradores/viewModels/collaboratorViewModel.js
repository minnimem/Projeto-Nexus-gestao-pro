import { normalizePerfil } from "../../../utils/permissions.js";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

export function getCollaboratorInitials(usuario) {
  return String(usuario.nome || usuario.login || "Colaborador")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getCollaboratorAvatarUrl(usuario) {
  return usuario.fotoUrl || usuario.avatarUrl || usuario.imagemUrl || usuario.fotoPerfil || "";
}

export function getCollaboratorAccessTone(usuario) {
  if (usuario.bloqueado) return "blocked";
  if (usuario.ativo === false) return "inactive";
  return "active";
}

export function getCollaboratorWorkStatus(usuario) {
  const rawStatus = normalizeStatus(
    usuario.statusRh
      || usuario.statusVinculo
      || usuario.situacao
      || usuario.situacaoRh
      || usuario["situação"]
      || usuario["situaçãoRh"]
      || "",
  );
  if (["FERIAS", "EM_FERIAS"].includes(rawStatus) || usuario.emFerias) return { key: "FERIAS", label: "Férias", tone: "warning" };
  if (["AFASTADO", "AFASTADA", "AFASTAMENTO"].includes(rawStatus) || usuario.afastado) return { key: "AFASTADO", label: "Afastado", tone: "warning" };
  if (["DESLIGADO", "DESLIGADA", "DEMITIDO", "DEMITIDA"].includes(rawStatus) || usuario.desligado) return { key: "DESLIGADO", label: "Desligado", tone: "danger" };
  if (usuario.bloqueado || usuario.ativo === false) return { key: "INATIVO", label: "Inativo", tone: "danger" };
  return { key: "ATIVO", label: "Ativo", tone: "success" };
}

export function getCollaboratorShift(usuario) {
  return usuario.turno || usuario.escala || usuario.jornada || usuario.horarioTrabalho || "Comercial";
}

export function getCollaboratorDepartment(usuario) {
  return usuario.departamento || usuario.setor || usuario.area || "Sem setor";
}

export function getCollaboratorHierarchyRole(usuario) {
  const perfil = normalizePerfil(usuario.perfil);
  const cargo = String(usuario.cargo || "").toLowerCase();
  if (["ADMIN", "GERENTE"].includes(perfil) || /gerente|diretor|coordenador|lider|líder/.test(cargo)) return "LIDER";
  if (/supervisor|encarregado|responsavel|responsável/.test(cargo)) return "SUPERVISOR";
  return "EQUIPE";
}
