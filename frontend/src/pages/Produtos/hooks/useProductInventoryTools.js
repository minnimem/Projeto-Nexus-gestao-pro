import { useState } from "react";
import {
  AlertTriangle,
  Barcode,
  ClipboardList,
  MapPinned,
  PackageCheck,
  Plus,
  ReceiptText,
  Truck,
} from "lucide-react";
import { formatNumber } from "../../../utils/formatters";

export function useProductInventoryTools({
  lowStockCount,
  setShowBrandForm,
  setShowProductCategoryForm,
  setShowProductForm,
  setShowSupplierForm,
}) {
  const [activeInventoryTool, setActiveInventoryTool] = useState("adjustment");
  const inventoryToolButtons = [
    { key: "product", label: "Produto", icon: Plus, detail: "Novo cadastro" },
    { key: "adjustment", label: "Ajuste", icon: PackageCheck, detail: "Entrada ou saida" },
    { key: "purchase", label: "Compra", icon: Truck, detail: "Fornecedor e NF" },
    { key: "count", label: "Contagem", icon: ClipboardList, detail: "Inventario fisico" },
    { key: "transfer", label: "Transferir", icon: MapPinned, detail: "Entre locais" },
    { key: "history", label: "Compras", icon: ReceiptText, detail: "Histórico" },
    { key: "labels", label: "Etiquetas", icon: Barcode, detail: "Preview e lote" },
    {
      key: "alerts",
      label: "Alertas",
      icon: AlertTriangle,
      detail: `${formatNumber(lowStockCount)} baixo`,
    },
  ];

  function openInventoryTool(tool) {
    setActiveInventoryTool(tool);
    setShowProductForm(tool === "product");

    if (tool !== "product") {
      setShowProductCategoryForm(false);
      setShowBrandForm(false);
      setShowSupplierForm(false);
    }
  }

  return {
    activeInventoryTool,
    inventoryToolButtons,
    openInventoryTool,
  };
}
