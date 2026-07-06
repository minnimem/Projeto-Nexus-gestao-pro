import { ArrowUpRight, FileText, RefreshCw, X } from "lucide-react";
import { FiscalActionButton } from "./FiscalActionButton";

export function FiscalLifecycleButtons({
  getFiscalStatus,
  getLatestFiscalDocument,
  handleCancelFiscalHomologation,
  handleGenerateFiscalDanfe,
  handleInvalidateFiscalHomologation,
  handleIssueFiscalCorrectionLetter,
  handleRegularizeFiscalContingency,
  handleReprocessFiscalRejection,
  pedido,
  savingOrderAction,
}) {
  const fiscalStatus = getFiscalStatus(pedido);
  const documento = getLatestFiscalDocument(pedido);

  return (
    <>
      {["AUTORIZADO", "CONTINGENCIA"].includes(fiscalStatus) && !documento.possuiDanfeHtml && (
        <FiscalActionButton
          actionKey="danfe"
          icon={FileText}
          onClick={handleGenerateFiscalDanfe}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Gerar DANFE/DANFCE/DANFSe de homologação"
        >
          DANFE
        </FiscalActionButton>
      )}

      {fiscalStatus === "AUTORIZADO" && documento.modelo === "NFE" && (
        <FiscalActionButton
          actionKey="cce"
          icon={FileText}
          onClick={handleIssueFiscalCorrectionLetter}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Registrar carta de correção de homologação"
        >
          CC-e
        </FiscalActionButton>
      )}

      {fiscalStatus === "CONTINGENCIA" && (
        <FiscalActionButton
          actionKey="regularizar-contingencia"
          icon={ArrowUpRight}
          onClick={handleRegularizeFiscalContingency}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Regularizar contingência fiscal pelo provedor configurado"
        >
          Regularizar
        </FiscalActionButton>
      )}

      {fiscalStatus === "AUTORIZADO" && (
        <FiscalActionButton
          actionKey="cancelado"
          danger
          icon={X}
          onClick={handleCancelFiscalHomologation}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Cancelar documento fiscal em homologação"
        >
          Cancelar
        </FiscalActionButton>
      )}

      {fiscalStatus === "REJEITADO" && (
        <FiscalActionButton
          actionKey="reprocessar-rejeicao"
          icon={RefreshCw}
          onClick={handleReprocessFiscalRejection}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Reprocessar documento fiscal rejeitado após correção"
        >
          Reprocessar
        </FiscalActionButton>
      )}

      {fiscalStatus === "REJEITADO" && (
        <FiscalActionButton
          actionKey="inutilizado"
          danger
          icon={X}
          onClick={handleInvalidateFiscalHomologation}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Inutilizar numeração fiscal em homologação"
        >
          Inutilizar
        </FiscalActionButton>
      )}
    </>
  );
}

