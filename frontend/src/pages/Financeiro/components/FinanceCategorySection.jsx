import { Download, Loader2, Plus, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceCategorySection({
  canMutateFinance,
  categoryForm,
  financeCategories,
  financeCategoryFilter,
  financeCategoryRows,
  financeCategorySummary,
  handleCreateFinanceCategory,
  saving,
  session,
  setCategoryForm,
  setFinanceCategoryFilter,
  setFinancePage,
  setShowCategoryForm,
  showCategoryForm,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Plano financeiro</h3>
          <p>Categorias formais e centros de custo usados nos lançamentos.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={financeCategoryRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-plano-financeiro-${getLocalDateKey()}.csv`, financeCategoryRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={financeCategoryRows.length === 0}
            onClick={() => printRowsDocument("Plano financeiro", financeCategoryRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
          {canMutateFinance && (
            <button onClick={() => setShowCategoryForm((current) => !current)} type="button">
              <Plus size={15} />
              Categoria
            </button>
          )}
        </div>
      </div>

      {showCategoryForm && (
        <form className="compact-form product-form" onSubmit={handleCreateFinanceCategory}>
          <div className="finance-form-row">
            <label className="form-control">
              <span>Nome</span>
              <input
                value={categoryForm.nome}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Ex.: Marketing, Compras, Administrativo"
              />
            </label>
            <label className="form-control checkbox-control">
              <input
                checked={categoryForm.centroCusto}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, centroCusto: event.target.checked }))}
                type="checkbox"
              />
              <span>Centro de custo</span>
            </label>
          </div>
          <label className="form-control">
            <span>Descrição</span>
            <textarea
              value={categoryForm.descricao}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, descricao: event.target.value }))}
              placeholder="Uso interno da categoria"
            />
          </label>
          <button className="checkout-button" disabled={saving} type="submit">
            {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
            {saving ? "Salvando..." : "Salvar categoria"}
          </button>
        </form>
      )}

      <div className="account-plan-grid">
        {financeCategorySummary.length === 0 ? (
          <div className="empty-selection compact">Nenhuma categoria movimentada no período.</div>
        ) : (
          financeCategorySummary.slice(0, 8).map((item) => {
            const formal = financeCategories.find((categoria) => categoria.nome === item.categoria);
            return (
              <button
                className={financeCategoryFilter === item.categoria ? "account-plan-item active" : "account-plan-item"}
                key={item.categoria}
                onClick={() => {
                  setFinanceCategoryFilter(financeCategoryFilter === item.categoria ? "" : item.categoria);
                  setFinancePage(0);
                }}
                type="button"
              >
                <span>{item.categoria}</span>
                <strong>{formatCurrency(item.total)}</strong>
                <small>
                  {formatNumber(item.registros)} registros
                  {formal.centroCusto ? " / centro de custo" : ""}
                </small>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
