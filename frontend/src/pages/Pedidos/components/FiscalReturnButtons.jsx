import { AlertTriangle, ArrowUpRight, CheckCircle2, FileText, X } from "lucide-react";
import { FiscalActionButton } from "./FiscalActionButton";

export function FiscalReturnButtons({
  getFiscalStatus,
  handleFiscalContingency,
  handleFiscalHomologationReturn,
  handleGenerateFiscalXml,
  handleTransmitFiscalHomologation,
  handleValidateFiscalXml,
  pedido,
  savingOrderAction,
}) {
  const status = getFiscalStatus(pedido);
  if (!["PREPARADO_HOMOLOGACAO", "EM_PROCESSAMENTO", "XML_VALIDADO"].includes(status)) return null;

  return (
    <>
      {status === "PREPARADO_HOMOLOGACAO" && (
        <FiscalActionButton
          actionKey="xml"
          icon={FileText}
          onClick={handleGenerateFiscalXml}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Gerar XML de homologação"
        >
          XML
        </FiscalActionButton>
      )}
      {status === "EM_PROCESSAMENTO" && (
        <FiscalActionButton
          actionKey="validar-xml"
          icon={CheckCircle2}
          onClick={handleValidateFiscalXml}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Validar XML de homologação"
        >
          Validar
        </FiscalActionButton>
      )}
      {status === "XML_VALIDADO" && (
        <FiscalActionButton
          actionKey="transmitir-fiscal"
          icon={ArrowUpRight}
          onClick={handleTransmitFiscalHomologation}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Transmitir homologação fiscal pelo provedor configurado"
        >
          Transmitir
        </FiscalActionButton>
      )}
      {status === "XML_VALIDADO" && (
        <FiscalActionButton
          actionKey="contingencia"
          icon={AlertTriangle}
          onClick={handleFiscalContingency}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Registrar contingência fiscal de homologação"
        >
          Contingencia
        </FiscalActionButton>
      )}
      {status === "XML_VALIDADO" && (
        <FiscalActionButton
          actionKey="autorizado"
          icon={CheckCircle2}
          onClick={(order) => handleFiscalHomologationReturn(order, "AUTORIZADO")}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Autorizar retorno de homologação"
        >
          Autorizar
        </FiscalActionButton>
      )}
      {status === "XML_VALIDADO" && (
        <FiscalActionButton
          actionKey="rejeitado"
          danger
          icon={X}
          onClick={(order) => handleFiscalHomologationReturn(order, "REJEITADO")}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          title="Rejeitar retorno de homologação"
        >
          Rejeitar
        </FiscalActionButton>
      )}
    </>
  );
}

