import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import "./ProductInventoryIntelligenceSection.css";

export function ProductInventoryIntelligenceSection({
  abcHighlights,
  companyName,
  inventoryIntelligenceRows,
  replenishmentSuggestions,
  selectedInventoryBranchLabel,
  stockSeveritySummary,
  totalInventorySalesValue,
}) {
  return (
    <section className="panel inventory-intelligence-panel">
      <div className="panel-title compact">
        <div>
          <h2>Inteligência de estoque</h2>
          <p>Curva ABC, giro, ruptura estimada e compra sugerida para {selectedInventoryBranchLabel}.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={inventoryIntelligenceRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-inteligencia-estoque-${getLocalDateKey()}.csv`, inventoryIntelligenceRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={inventoryIntelligenceRows.length === 0}
            onClick={() => printRowsDocument("Inteligência de estoque", inventoryIntelligenceRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="stock-severity-grid">
        <div className="stock-severity-card critical">
          <span>Crítico</span>
          <strong>{formatNumber(stockSeveritySummary.critico)}</strong>
          <small>abaixo de 50% do mínimo</small>
        </div>
        <div className="stock-severity-card low">
          <span>Baixo</span>
          <strong>{formatNumber(stockSeveritySummary.baixo)}</strong>
          <small>até o mínimo operacional</small>
        </div>
        <div className="stock-severity-card normal">
          <span>Normal</span>
          <strong>{formatNumber(stockSeveritySummary.normal)}</strong>
          <small>acima do mínimo</small>
        </div>
      </div>

      <div className="inventory-intelligence-grid">
        <div className="inventory-insight-column">
          <div className="inventory-insight-title">
            <span>Reposição sugerida</span>
            <strong>{formatNumber(replenishmentSuggestions.length)} prioridade(s)</strong>
          </div>
          {replenishmentSuggestions.length === 0 ? (
            <div className="empty-selection compact">Nenhuma reposição urgente com os parâmetros atuais.</div>
          ) : (
            replenishmentSuggestions.map((item) => (
              <div className={`inventory-insight-row ${item.statusEstoque.toLowerCase()}`} key={item.produto.id || item.produto.nome}>
                <div>
                  <strong>{item.produto.nome || "Produto sem nome"}</strong>
                  <small>{item.produto.fornecedor || "Fornecedor não informado"} / curva {item.curva}</small>
                  <small>Custo médio {item.custoMedio > 0 ? formatCurrency(item.custoMedio) : "não calculado"}</small>
                </div>
                <span>{formatNumber(item.reposicaoSugerida)} un.</span>
              </div>
            ))
          )}
        </div>

        <div className="inventory-insight-column">
          <div className="inventory-insight-title">
            <span>Curva ABC e giro</span>
            <strong>{formatCurrency(totalInventorySalesValue)}</strong>
          </div>
          {abcHighlights.length === 0 ? (
            <div className="empty-selection compact">Sem vendas concluídas para calcular giro.</div>
          ) : (
            abcHighlights.map((item) => (
              <div className="inventory-insight-row" key={item.produto.id || item.produto.nome}>
                <div>
                  <strong>{item.produto.nome || "Produto sem nome"}</strong>
                  <small>{formatNumber(item.vendasQuantidade)} un. vendidas / ruptura {item.diasRuptura == null ? "sem giro" : `${formatNumber(item.diasRuptura)} dia(s)`}</small>
                  <small>Custo médio {item.custoMedio > 0 ? formatCurrency(item.custoMedio) : "não calculado"}</small>
                </div>
                <span>{item.curva}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
