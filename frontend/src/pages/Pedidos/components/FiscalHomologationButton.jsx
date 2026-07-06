import { CheckCircle2, Loader2 } from "lucide-react";

export function FiscalHomologationButton({
  getFiscalStatus,
  handlePrepareFiscalHomologation,
  pedido,
  savingOrderAction,
}) {
  const actionKey = `homologacao-${pedido.id}`;
  const prepared = getFiscalStatus(pedido) === "PREPARADO_HOMOLOGACAO";

  return (
    <button
      className="mini-action-button"
      disabled={savingOrderAction === actionKey || prepared}
      onClick={() => handlePrepareFiscalHomologation(pedido)}
      title="Preparar documento fiscal de homologação"
      type="button"
    >
      {savingOrderAction === actionKey ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />}
      {prepared ? "Preparado" : "Homologar"}
    </button>
  );
}
