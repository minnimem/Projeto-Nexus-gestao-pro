import { Loader2, Search } from "lucide-react";

export function FiscalConsultButton({
  getLatestFiscalDocument,
  handleConsultFiscalHomologation,
  pedido,
  savingOrderAction,
}) {
  if (!getLatestFiscalDocument(pedido).id) {
    return null;
  }

  const loading = savingOrderAction === `consulta-fiscal-${pedido.id}`;

  return (
    <button
      className="mini-action-button"
      disabled={loading}
      onClick={() => handleConsultFiscalHomologation(pedido)}
      title="Consultar situação da homologação fiscal"
      type="button"
    >
      {loading ? <Loader2 className="spin" size={15} /> : <Search size={15} />}
      Consulta
    </button>
  );
}
