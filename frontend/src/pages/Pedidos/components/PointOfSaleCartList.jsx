import { Minus, Plus, ReceiptText, X } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function PointOfSaleCartList({
  cart,
  changeQuantity,
  removeProduct,
  setQuantity,
}) {
  return (
    <div className="cart-list">
      {cart.length === 0 ? (
        <div className="empty-cart">
          <ReceiptText size={24} />
          <span>Nenhum item adicionado.</span>
        </div>
      ) : (
        cart.map((item) => (
          <div className="cart-row" key={item.produtoId}>
            <div>
              <strong>{item.nome}</strong>
              <small>
                {formatCurrency(item.preco)} un. | Estoque {formatNumber(item.estoqueDisponivel)}
              </small>
            </div>
            <div className="qty-control">
              <button onClick={() => changeQuantity(item.produtoId, -1)} title="Diminuir" type="button">
                <Minus size={14} />
              </button>
              <input
                aria-label={`Quantidade de ${item.nome}`}
                inputMode="numeric"
                min="1"
                max={Math.max(1, Number(item.estoqueDisponivel || 1))}
                type="number"
                value={item.quantidade}
                onChange={(event) => setQuantity(item.produtoId, event.target.value)}
                onFocus={(event) => event.target.select()}
              />
              <button onClick={() => changeQuantity(item.produtoId, 1)} title="Aumentar" type="button">
                <Plus size={14} />
              </button>
            </div>
            <strong>{formatCurrency(item.preco * item.quantidade)}</strong>
            <button className="icon-danger" onClick={() => removeProduct(item.produtoId)} title="Remover" type="button">
              <X size={14} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
