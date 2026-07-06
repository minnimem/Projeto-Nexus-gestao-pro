import { X } from "lucide-react";
import { getClientName } from "../../../utils/customers";

export function PointOfSaleCheckoutHeader({
  cart,
  resetSaleDraft,
  selectedCliente,
}) {
  return (
    <div className="panel-title compact">
      <div>
        <h2>Carrinho</h2>
        <p>{selectedCliente ? getClientName(selectedCliente) : "Aguardando cliente"}</p>
      </div>
      {cart.length > 0 && (
        <button className="cart-clear-button" onClick={resetSaleDraft} type="button">
          <X size={15} />
          Limpar
        </button>
      )}
    </div>
  );
}
