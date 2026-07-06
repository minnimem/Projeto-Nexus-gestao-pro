import { CheckCircle2, Download, Loader2, Search } from "lucide-react";

export function FiscalRealButtons({
  getLatestFiscalDocument,
  handleConsultFiscalRealReadiness,
  handleDownloadFiscalRealChecklist,
  handleDownloadFiscalRealPackage,
  handleDownloadFiscalRealPackageManifest,
  handleValidateFiscalRealPackageIntegrity,
  pedido,
  savingOrderAction,
}) {
  const documento = getLatestFiscalDocument(pedido);
  if (!documento.id) {
    return null;
  }

  const actions = [
    {
      actionKey: "status-real",
      handler: handleConsultFiscalRealReadiness,
      icon: Search,
      label: "Status real",
      title: "Consultar prontidão para emissão fiscal real",
    },
    {
      actionKey: "download-checklist-real",
      handler: handleDownloadFiscalRealChecklist,
      label: "Checklist real",
      title: "Baixar checklist de emissão fiscal real",
    },
    {
      actionKey: "download-pacote-real",
      handler: handleDownloadFiscalRealPackage,
      label: "Pacote real",
      title: "Baixar pacote JSON para emissão fiscal real",
    },
    {
      actionKey: "download-manifesto-real",
      handler: handleDownloadFiscalRealPackageManifest,
      label: "Manifesto",
      title: "Baixar manifesto de integridade do pacote real",
    },
    {
      actionKey: "validar-pacote-real",
      handler: handleValidateFiscalRealPackageIntegrity,
      icon: CheckCircle2,
      label: "Validar pacote",
      title: "Validar integridade do pacote real",
    },
  ];

  return actions.map(({ actionKey, handler, icon: Icon = Download, label, title }) => {
    const loadingKey = `${actionKey}-${pedido.id}`;
    return (
      <button
        className="mini-action-button"
        disabled={savingOrderAction === loadingKey}
        key={actionKey}
        onClick={() => handler(pedido)}
        title={title}
        type="button"
      >
        {savingOrderAction === loadingKey ? <Loader2 className="spin" size={15} /> : <Icon size={15} />}
        {label}
      </button>
    );
  });
}
