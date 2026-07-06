export function SalesOrderOperationalAction({
  handleSeparationAction,
  pedido,
  savingOrderAction,
  status,
  tipoEntrega,
}) {
  const commonProps = {
    className: "mini-action-button",
    disabled: savingOrderAction === pedido.id,
    type: "button",
  };

  if (status === "PENDENTE" && tipoEntrega !== "RETIRADA_LOJA") {
    return (
      <button {...commonProps} onClick={() => handleSeparationAction(pedido.id, "start", tipoEntrega)}>
        {savingOrderAction === pedido.id ? "Processando..." : "Separar"}
      </button>
    );
  }

  if (status === "RECEBIDO" && tipoEntrega === "RETIRADA_LOJA") {
    return (
      <button {...commonProps} onClick={() => handleSeparationAction(pedido.id, "start", tipoEntrega)}>
        {savingOrderAction === pedido.id ? "Processando..." : "Retirar estoque"}
      </button>
    );
  }

  if (status === "SEPARACAO") {
    return (
      <button {...commonProps} onClick={() => handleSeparationAction(pedido.id, "finish", tipoEntrega)}>
        {savingOrderAction === pedido.id ? "Processando..." : "Concluir"}
      </button>
    );
  }

  return null;
}
