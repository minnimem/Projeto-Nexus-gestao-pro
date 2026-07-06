import { ClipboardList, Loader2 } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import { getProductStockQuantity } from "../../../utils/stock";

import "./ProductStockForm.css";

export function ProductInventoryCountForm({
  form,
  inventoryDifference,
  onSubmit,
  produtos,
  saving,
  selectedProduct,
  setForm,
}) {
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="inventory-tool-card">
      <div className="panel-title compact">
        <div>
          <h2>Contagem física</h2>
          <p>Inventario com ajuste automático da divergencia.</p>
        </div>
      </div>

      <form className="stock-form" onSubmit={onSubmit}>
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
          <div className="reconciliation-grid compact-metrics-grid">
            <div>
              <span>Sistema</span>
              <strong>{formatNumber(getProductStockQuantity(selectedProduct))}</strong>
              <small>saldo atual</small>
            </div>
            <div>
              <span>Divergencia</span>
              <strong>{formatNumber(inventoryDifference)}</strong>
              <small>{inventoryDifference === 0 ? "sem ajuste" : inventoryDifference > 0 ? "entrada" : "saida"}</small>
            </div>
          </div>
        )}

        <label>
          <span>Contagem física</span>
          <input
            min="0"
            type="number"
            value={form.quantidadeContada}
            onChange={(event) => updateField("quantidadeContada", event.target.value)}
          />
        </label>

        <label>
          <span>Observação</span>
          <textarea
            value={form.observacao}
            onChange={(event) => updateField("observacao", event.target.value)}
            placeholder="Ex.: contagem mensal, avaria, sobra física"
          />
        </label>

        <button disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <ClipboardList size={17} />}
          {saving ? "Ajustando..." : "Registrar inventario"}
        </button>
      </form>
    </section>
  );
}
