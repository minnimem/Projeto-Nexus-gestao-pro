import { ClipboardList } from "lucide-react";

export function SalesOrdersEmptyRow() {
  return (
    <tr>
      <td colSpan="5" className="empty-cell">
        <div className="table-empty-state">
          <ClipboardList size={20} />
          <strong>Nenhum pedido encontrado</strong>
          <small>Ajuste status, período ou filial para ampliar a busca.</small>
        </div>
      </td>
    </tr>
  );
}
