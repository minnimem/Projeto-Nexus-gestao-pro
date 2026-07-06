import { FiscalActionGroups } from "./FiscalActionGroups";
import { FiscalDocumentCell } from "./FiscalDocumentCell";
import { FiscalModelSelect } from "./FiscalModelSelect";
import { FiscalStatusSelect } from "./FiscalStatusSelect";

export function FiscalQueueTableRow({
  fiscalActionRenderers,
  fiscalModelOptions,
  fiscalStatusOptions,
  formatCurrency,
  formatDateTime,
  getFiscalModelForOrder,
  getFiscalRealConclusion,
  getFiscalStatus,
  getLatestFiscalDocument,
  handlePrintFiscalMirror,
  pedido,
  savingOrderAction,
  setFiscalModelByOrder,
  updateFiscalStatus,
}) {
  const documento = getLatestFiscalDocument(pedido);
  const selectedModel = getFiscalModelForOrder(pedido);
  const realConclusion = getFiscalRealConclusion(pedido);

  return (
    <tr>
      <td>
        <strong>{pedido.numero || pedido.id}</strong>
        <small>{formatDateTime(pedido.data)}</small>
      </td>
      <td>
        <strong>{pedido.cliente || "Cliente não informado"}</strong>
        <small>{pedido.filial || "Empresa / sem filial"}</small>
      </td>
      <td>
        <FiscalModelSelect
          documento={documento}
          fiscalModelOptions={fiscalModelOptions}
          pedido={pedido}
          selectedModel={selectedModel}
          setFiscalModelByOrder={setFiscalModelByOrder}
        />
      </td>
      <td>
        <FiscalStatusSelect
          fiscalStatusOptions={fiscalStatusOptions}
          getFiscalStatus={getFiscalStatus}
          pedido={pedido}
          updateFiscalStatus={updateFiscalStatus}
        />
      </td>
      <td>
        <FiscalDocumentCell
          documento={documento}
          realConclusion={realConclusion}
        />
      </td>
      <td>{formatCurrency(pedido.valor)}</td>
      <td>
        <FiscalActionGroups
          fiscalActionRenderers={fiscalActionRenderers}
          fiscalStatusOptions={fiscalStatusOptions}
          getFiscalStatus={getFiscalStatus}
          handlePrintFiscalMirror={handlePrintFiscalMirror}
          includeConsult
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          updateFiscalStatus={updateFiscalStatus}
        />
      </td>
    </tr>
  );
}
