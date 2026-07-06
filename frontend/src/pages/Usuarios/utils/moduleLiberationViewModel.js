import { liberationModules } from "../../../constants/admin.js";

export function buildModuleLiberationRows(liberacoes) {
  return liberationModules.map((module) => {
    const release = liberacoes.find((item) => item.modulo === module.modulo) || {};
    return {
      ...module,
      ...release,
      status: release.status || "BLOQUEADO",
      contratado: Boolean(release.contratado),
      liberado: Boolean(release.liberado),
      liberadoPorPlano: Boolean(release.liberadoPorPlano),
    };
  });
}
