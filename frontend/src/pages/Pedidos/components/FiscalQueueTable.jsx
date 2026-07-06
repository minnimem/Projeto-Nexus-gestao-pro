import { FileText } from "lucide-react";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { formatCurrency, formatDateTime } from "../../../utils/formatters";
import { FiscalQueueTableRow } from "./FiscalQueueTableRow";

export function FiscalQueueTable({
  fiscalActionRenderers,
  fiscalModelOptions,
  fiscalStatusOptions,
  getFiscalModelForOrder,
  getFiscalRealConclusion,
  getFiscalStatus,
  getLatestFiscalDocument,
  handlePrintFiscalMirror,
  savingOrderAction,
  setFiscalModelByOrder,
  updateFiscalStatus,
  visibleFiscalOrders,
}) {
  return (
    <div className="table-wrap fiscal-queue-table">
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Modelo</th>
            <th>Status fiscal</th>
            <th>Documento</th>
            <th>Valor</th>
            <th>Ações fiscais</th>
          </tr>
        </thead>
        <tbody>
          {visibleFiscalOrders.length === 0 ? (
            <TableEmptyState
              colSpan="7"
              icon={FileText}
              title="Nenhum pedido fiscal encontrado"
              detail="Ajuste o filtro ou homologue um pedido para iniciar a fila fiscal."
            />
          ) : (
            visibleFiscalOrders.map((pedido) => (
              <FiscalQueueTableRow
                fiscalActionRenderers={fiscalActionRenderers}
                fiscalModelOptions={fiscalModelOptions}
                fiscalStatusOptions={fiscalStatusOptions}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
                getFiscalModelForOrder={getFiscalModelForOrder}
                getFiscalRealConclusion={getFiscalRealConclusion}
                getFiscalStatus={getFiscalStatus}
                getLatestFiscalDocument={getLatestFiscalDocument}
                handlePrintFiscalMirror={handlePrintFiscalMirror}
                key={`fiscal-${pedido.id}`}
                pedido={pedido}
                savingOrderAction={savingOrderAction}
                setFiscalModelByOrder={setFiscalModelByOrder}
                updateFiscalStatus={updateFiscalStatus}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
