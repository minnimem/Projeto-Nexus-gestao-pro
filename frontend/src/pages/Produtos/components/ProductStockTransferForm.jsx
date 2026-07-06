import { Download, Loader2, Printer, Truck } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { getProductStockQuantity } from "../../../utils/stock";

import "./ProductStockForm.css";

export function ProductStockTransferForm({
  companyName,
  form,
  onSubmit,
  produtos,
  saving,
  selectedOriginStock,
  selectedProduct,
  setForm,
  stockLocationRows,
  transferLocations,
}) {
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="inventory-tool-card">
      <div className="panel-title compact">
        <div>
          <h2>Transferéncia entre locais</h2>
          <p>Movimente saldo entre matriz, deposito e filiais.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={stockLocationRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-saldos-local-${getLocalDateKey()}.csv`, stockLocationRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={stockLocationRows.length === 0}
            onClick={() => printRowsDocument("Saldos por local", stockLocationRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
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
              <span>Origem</span>
              <strong>{formatNumber(selectedOriginStock.quantidade || 0)}</strong>
              <small>{form.origem || "GERAL"}</small>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatNumber(getProductStockQuantity(selectedProduct))}</strong>
              <small>saldo geral</small>
            </div>
          </div>
        )}

        <div className="finance-form-row">
          <label>
            <span>Origem</span>
            <select value={form.origem} onChange={(event) => updateField("origem", event.target.value)}>
              {transferLocations.map((local) => (
                <option key={local} value={local}>{local}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Destino</span>
            <input
              value={form.destino}
              onChange={(event) => updateField("destino", event.target.value)}
              placeholder="Ex.: FILIAL CENTRO"
            />
          </label>
        </div>

        <label>
          <span>Quantidade</span>
          <input
            min="1"
            type="number"
            value={form.quantidade}
            onChange={(event) => updateField("quantidade", event.target.value)}
          />
        </label>

        <label>
          <span>Observação</span>
          <textarea
            value={form.observacao}
            onChange={(event) => updateField("observacao", event.target.value)}
            placeholder="Ex.: reposição filial, remanejamento, avaria"
          />
        </label>

        <button disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
          {saving ? "Transferindo..." : "Transferir saldo"}
        </button>
      </form>
    </section>
  );
}
