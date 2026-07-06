import { moduleDescriptions } from "../../../constants/modules";

export function getActiveDashboardModule(active, visibleModules) {
  return visibleModules.find((item) => item.value === active) || visibleModules[0];
}

export function getDashboardCommandMatches(globalSearch, visibleModules) {
  const term = globalSearch.trim().toLowerCase();
  if (!term) return [];

  return visibleModules
    .filter((module) => (
      `${module.label} ${moduleDescriptions[module.value] || ""}`.toLowerCase().includes(term)
    ))
    .slice(0, 5);
}

export function getDashboardQuickActions(active, visibleModules) {
  const findModule = (value) => visibleModules.find((module) => module.value === value);
  const baseValues = active === "overview"
    ? ["pedidos", "caixa", "servicos", "logistica", "financeiro"]
    : ["overview", "relatorios", "usuarios"];

  return baseValues
    .map(findModule)
    .filter(Boolean)
    .filter((module) => module.value !== active)
    .slice(0, 5);
}
