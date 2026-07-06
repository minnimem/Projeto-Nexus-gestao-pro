import { Loader2, PackageCheck, Plus } from "lucide-react";
import { formatCurrency, formatDate, formatNumber, parseDecimalInput } from "../../../utils/formatters";
import { cashPaymentOptions } from "../../../utils/payments";
import "./ProductPurchaseForm.css";
import "./ProductStockForm.css";
import { getProductStockQuantity } from "../../../utils/stock";

export function ProductPurchaseForm({
  fornecedores,
  form,
  onAddItem,
  onRemoveItem,
  onSubmit,
  produtos,
  purchaseItems,
  purchaseTotal,
  saving,
  selectedProduct,
  selectedProductCost,
  selectedSupplier,
  setForm,
}) {
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="inventory-tool-card inventory-purchase-card">
      <div className="panel-title compact">
        <div>
          <h2>Compra com fornecedor</h2>
          <p>Entrada de estoque com despesa no financeiro.</p>
        </div>
      </div>

      <form className="stock-form" onSubmit={onSubmit}>
        <label>
          <span>Fornecedor</span>
          <select value={form.fornecedorId} onChange={(event) => updateField("fornecedorId", event.target.value)}>
            <option value="">Selecione</option>
            {fornecedores.map((fornecedor) => (
              <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Produto</span>
          <select value={form.produtoId} onChange={(event) => updateField("produtoId", event.target.value)}>
            <option value="">Selecione</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>{produto.nome}</option>
            ))}
          </select>
        </label>
        {selectedProduct && (
          <>
            <p className="stock-current">
              Saldo atual: <strong>{formatNumber(getProductStockQuantity(selectedProduct))}</strong> unidades
            </p>
            <div className="purchase-cost-preview">
              <div>
                <span>Custo medio atual</span>
                <strong>
                  {selectedProductCost.quantidade > 0
                    ?
                    formatCurrency(selectedProductCost.total / selectedProductCost.quantidade)
                    : "Sem histórico"}
                </strong>
              </div>
              <div>
                <span>Última compra</span>
                <strong>{selectedProductCost.ultimaCompra ? formatDate(selectedProductCost.ultimaCompra) : "-"}</strong>
              </div>
              <div>
                <span>Novo custo</span>
                <strong>{formatCurrency(parseDecimalInput(form.valorTotal))}</strong>
              </div>
            </div>
          </>
        )}
        {selectedSupplier && (
          <p className="stock-current">Fornecedor: <strong>{selectedSupplier.documento}</strong></p>
        )}
        <div className="finance-form-row">
          <label>
            <span>Quantidade</span>
            <input min="1" type="number" value={form.quantidade} onChange={(event) => updateField("quantidade", event.target.value)} />
          </label>
          <label>
            <span>Preço unitário</span>
            <input min="0.01" step="0.01" type="number" value={form.valorTotal} onChange={(event) => updateField("valorTotal", event.target.value)} />
          </label>
        </div>
        <button className="panel-action-button secondary" onClick={onAddItem} type="button">
          <Plus size={16} />
          Adicionar item
        </button>
        {purchaseItems.length > 0 && (
          <div className="table-wrap compact-table">
            <table>
              <tbody>
                {purchaseItems.map((item, index) => (
                  <tr key={`${item.produtoId}-${index}`}>
                    <td>
                      <strong>{item.produto}</strong>
                      <small>{formatNumber(item.quantidade)} x {formatCurrency(item.precoUnitario)}</small>
                    </td>
                    <td>{formatCurrency(item.subtotal)}</td>
                    <td>
                      <button className="mini-action-button" onClick={() => onRemoveItem(index)} type="button">Remover</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{formatCurrency(purchaseTotal)}</strong></td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="finance-form-row">
          <label>
            <span>Pagamento</span>
            <select value={form.metodoPagamento} onChange={(event) => updateField("metodoPagamento", event.target.value)}>
              {cashPaymentOptions.filter((option) => option.value !== "MISTO").map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Pago</option>
            </select>
          </label>
        </div>
        <div className="finance-form-row">
          <label>
            <span>Vencimento</span>
            <input type="date" value={form.dataVencimento} onChange={(event) => updateField("dataVencimento", event.target.value)} />
          </label>
          <label>
            <span>Documento</span>
            <input value={form.numeroDocumento} onChange={(event) => updateField("numeroDocumento", event.target.value)} placeholder="NF, pedido ou boleto" />
          </label>
        </div>
        <label>
          <span>Observação</span>
          <textarea value={form.observacao} onChange={(event) => updateField("observacao", event.target.value)} />
        </label>
        <button disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
          {saving ? "Registrando..." : "Registrar compra"}
        </button>
      </form>
    </section>
  );
}
