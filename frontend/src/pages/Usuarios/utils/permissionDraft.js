import {
  actionPermissionKey,
  modulePermissionKey,
} from "../../../utils/permissions";
import { asList } from "../../../utils/formatters";
import {
  userPermissionActions,
  userPermissionModules,
} from "../../../constants/admin";

export function buildPermissionDraft(usuario) {
  const extras = new Set(asList(usuario.permissoesExtras));
  const blocked = new Set(asList(usuario.permissoesBloqueadas));
  const draft = {};

  userPermissionModules.forEach((module) => {
    const key = modulePermissionKey(module.value);
    draft[key] = extras.has(key) ? "LIBERAR" : blocked.has(key) ? "BLOQUEAR" : "PADRAO";
  });

  userPermissionActions.forEach((action) => {
    const key = actionPermissionKey(action.key);
    draft[key] = extras.has(key) ? "LIBERAR" : blocked.has(key) ? "BLOQUEAR" : "PADRAO";
  });

  return draft;
}
