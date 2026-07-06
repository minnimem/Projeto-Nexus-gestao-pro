import {
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  FileText,
  Route,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

export const modules = [
  { label: "Visão Geral", icon: ChartNoAxesCombined, value: "overview" },
  { label: "Vendas", icon: ShoppingCart, value: "pedidos" },
  { label: "Caixa", icon: CreditCard, value: "caixa" },
  { label: "Clientes", icon: UserRound, value: "clientes" },
  { label: "Serviços", icon: ClipboardList, value: "servicos" },
  { label: "Estoque", icon: Boxes, value: "produtos" },
  { label: "Financeiro", icon: WalletCards, value: "financeiro" },
  { label: "Logística", icon: Route, value: "logistica" },
  { label: "Colaboradores", icon: UsersRound, value: "colaboradores" },
  { label: "Relatórios", icon: FileText, value: "relatorios" },
  { label: "Empresas", icon: Building2, value: "empresas" },
  { label: "Painel controle", icon: ShieldCheck, value: "usuarios" },
];

export const periodPresets = {
  today: "Hoje",
  sevenDays: "Últimos 7 dias",
  month: "Mês atual",
  year: "Ano atual",
};

export const moduleDescriptions = {
  overview: "Operação consolidada com vendas, financeiro, estoque e logística em tempo real.",
  pedidos: "Central comercial com PDV, pedidos, fiscal, separação e follow-up.",
  caixa: "Recebimentos, abertura, fechamento e conciliação operacional.",
  clientes: "Carteira, histórico de compras e relacionamento por filial.",
  servicos: "Ordens de serviço, técnico, checklist, prazo, status e faturamento.",
  produtos: "Estoque, compras, etiquetas, alertas e transferência entre locais.",
  financeiro: "Contas, cobranças, recorrências, inadimplência e fluxo de caixa.",
  logistica: "Rotas, entregas, romaneios, veículos e equipe de campo.",
  colaboradores: "Equipe, metas, cargos, filiais e indicadores internos.",
  relatorios: "Análises executivas por período, filial e módulo operacional.",
  empresas: "Central master para plano, assinatura e adicionais por empresa.",
  usuarios: "Configurações, acessos, auditoria, fiscal e estrutura da empresa.",
};
