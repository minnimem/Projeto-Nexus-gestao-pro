import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { FiscalActionButton } from "./FiscalActionButton";

export function FiscalFileButtons({
  getLatestFiscalDocument,
  handleDownloadFiscalCorrectionLetter,
  handleDownloadFiscalDanfe,
  handleDownloadFiscalDossiêr,
  handleDownloadFiscalPayload,
  handleDownloadFiscalPendencies,
  handleDownloadFiscalReturnXml,
  handleDownloadFiscalXml,
  handleRevalidateFiscalPendencies,
  pedido,
  savingOrderAction,
}) {
  const documento = getLatestFiscalDocument(pedido);
  const actions = [
    {
      actionKey: "download-json",
      handler: handleDownloadFiscalPayload,
      label: "JSON",
      title: "Baixar payload fiscal JSON",
      visible: documento.possuiPayloadJson,
    },
    {
      actionKey: "download-pendências",
      handler: handleDownloadFiscalPendencies,
      icon: AlertTriangle,
      label: "Pendências",
      title: "Baixar pendências fiscais de cadastro",
      visible: documento.possuiPendenciasFiscais,
    },
    {
      actionKey: "revalidar-pendências",
      handler: handleRevalidateFiscalPendencies,
      icon: RefreshCw,
      label: "Revalidar",
      title: "Revalidar pendências fiscais após corrigir cadastros",
      visible: documento.id && documento.possuiPendenciasFiscais,
    },
    {
      actionKey: "download-xml",
      handler: handleDownloadFiscalXml,
      label: "Baixar XML",
      title: "Baixar XML fiscal de homologação",
      visible: documento.possuiXmlEnvio,
    },
    {
      actionKey: "download-retorno",
      handler: handleDownloadFiscalReturnXml,
      label: "Retorno",
      title: "Baixar XML de retorno fiscal",
      visible: documento.possuiXmlRetorno,
    },
    {
      actionKey: "download-danfe",
      handler: handleDownloadFiscalDanfe,
      label: "DANFE",
      title: "Baixar DANFE/DANFCE/DANFSe de homologação",
      visible: documento.possuiDanfeHtml,
    },
    {
      actionKey: "download-cce",
      handler: handleDownloadFiscalCorrectionLetter,
      label: "XML CC-e",
      title: "Baixar CC-e de homologação",
      visible: documento.possuiCartaCorrecao,
    },
    {
      actionKey: "download-dossie",
      handler: handleDownloadFiscalDossiêr,
      label: "Dossiê",
      title: "Baixar dossie fiscal de homologação",
      visible: documento.id,
    },
  ];

  return actions.filter(({ visible }) => visible).map(({ actionKey, handler, icon: Icon = Download, label, title }) => (
    <FiscalActionButton
      actionKey={actionKey}
      icon={Icon}
      key={actionKey}
      onClick={handler}
      pedido={pedido}
      savingOrderAction={savingOrderAction}
      title={title}
    >
      {label}
    </FiscalActionButton>
  ));
}
