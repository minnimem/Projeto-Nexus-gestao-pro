import { Loader2 } from "lucide-react";

export function FiscalActionButton({
  actionKey,
  children,
  danger = false,
  icon: Icon,
  onClick,
  pedido,
  savingOrderAction,
  title,
}) {
  const loading = savingOrderAction === `${actionKey}-${pedido.id}`;

  return (
    <button
      className={`mini-action-button${danger ? " danger" : ""}`}
      disabled={loading}
      onClick={() => onClick(pedido)}
      title={title}
      type="button"
    >
      {loading ? <Loader2 className="spin" size={15} /> : <Icon size={15} />}
      {children}
    </button>
  );
}
