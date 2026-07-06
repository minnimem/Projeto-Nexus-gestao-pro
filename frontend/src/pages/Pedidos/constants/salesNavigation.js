import {
  ArrowUpRight,
  ChartNoAxesCombined,
  ClipboardList,
  PackageCheck,
  Phone,
  ReceiptText,
  ShoppingCart,
  UsersRound,
} from "lucide-react";

export const SALES_VIEWS = [
  { value: "overview", label: "Resumo", icon: ChartNoAxesCombined },
  { value: "pdv", label: "Nova venda", icon: ShoppingCart },
  { value: "orders", label: "Pedidos", icon: ClipboardList },
  { value: "followup", label: "CRM", icon: Phone },
  { value: "separation", label: "Separação", icon: PackageCheck },
  { value: "analytics", label: "Analytics", icon: ArrowUpRight },
  { value: "ranking", label: "Ranking", icon: UsersRound },
  { value: "fiscal", label: "Nota fiscal", icon: ReceiptText },
];
