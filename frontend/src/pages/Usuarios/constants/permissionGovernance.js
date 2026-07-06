export const permissionProfiles = [
  "MASTER",
  "ADMIN",
  "GERENTE",
  "VENDEDOR",
  "OPERADOR_CAIXA",
  "ESTOQUISTA",
  "FINANCEIRO",
];

export const criticalPermissions = [
  { label: "Vender", profiles: ["ADMIN", "GERENTE", "VENDEDOR"] },
  { label: "Gerir follow-up comercial", profiles: ["ADMIN", "GERENTE", "VENDEDOR"] },
  { label: "Abrir/fechar caixa", profiles: ["ADMIN", "GERENTE", "OPERADOR_CAIXA"] },
  { label: "Movimentar financeiro", profiles: ["ADMIN", "GERENTE", "FINANCEIRO"] },
  { label: "Estornar financeiro", profiles: ["ADMIN"] },
  { label: "Ver lucro", profiles: ["ADMIN", "GERENTE", "FINANCEIRO"] },
  { label: "Editar rotas", profiles: ["ADMIN", "GERENTE", "ESTOQUISTA"] },
  { label: "Administrar usuários", profiles: ["ADMIN"] },
  { label: "Gerenciar planos comerciais", profiles: ["MASTER"] },
];

export const sensitivePermissionDefinitions = [
  { key: "operateCash", label: "Operar caixa", risk: "medio" },
  { key: "mutateFinance", label: "Editar financeiro", risk: "alto" },
  { key: "reverseFinance", label: "Estornar financeiro", risk: "crítico" },
  { key: "seeProfit", label: "Ver lucro", risk: "alto" },
  { key: "exportJson", label: "Exportar JSON", risk: "crítico" },
  { key: "managePlans", label: "Gerenciar planos", risk: "crítico" },
  { key: "editRoute", label: "Editar rotas", risk: "medio" },
];
