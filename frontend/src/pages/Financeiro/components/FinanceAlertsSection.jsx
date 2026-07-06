import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function FinanceAlertsSection({
  canMutateFinance,
  contasAPagarAVencer,
  contasAPagarVencidas,
  contasAReceberAVencer,
  contasAReceberVencidas,
  handleBulkBaixarFinanceiro,
  saving,
  setFinanceCategoryFilter,
  setFinanceFilter,
  setFinancePage,
  totalAPagarAVencer,
  totalAPagarVencido,
  totalAReceberAVencer,
  totalAReceberVencido,
  totalContasAVencer,
  totalContasVencidas,
}) {
  const showFinanceFilter = (filter) => {
    setFinanceFilter(filter);
    setFinanceCategoryFilter("");
    setFinancePage(0);
  };

  return (
    <>
      {totalContasVencidas > 0 && (
        <div className="warning-box finance-warning-box overdue-warning-box">
          <div className="finance-warning-copy">
            <strong>{formatNumber(totalContasVencidas)} contas vencidas exigem ação.</strong>
            <small>
              A receber: {formatCurrency(totalAReceberVencido)} / A pagar: {formatCurrency(totalAPagarVencido)}
            </small>
          </div>
          {canMutateFinance && (
            <div className="warning-actions">
              {contasAReceberVencidas.length > 0 && (
                <button disabled={saving} onClick={() => handleBulkBaixarFinanceiro(contasAReceberVencidas, "a receber vencidos")} type="button">
                  Baixar recebidas
                </button>
              )}
              {contasAPagarVencidas.length > 0 && (
                <button disabled={saving} onClick={() => handleBulkBaixarFinanceiro(contasAPagarVencidas, "a pagar vencidos")} type="button">
                  Baixar pagas
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {totalContasAVencer > 0 && (
        <div className="warning-box finance-warning-box upcoming-warning-box">
          <div className="finance-warning-copy">
            <strong>{formatNumber(totalContasAVencer)} contas vencem nos próximos 7 dias.</strong>
            <small>
              A receber: {formatCurrency(totalAReceberAVencer)} / A pagar: {formatCurrency(totalAPagarAVencer)}
            </small>
          </div>
          <div className="warning-actions">
            {contasAReceberAVencer.length > 0 && (
              <button onClick={() => showFinanceFilter("A_RECEBER_VENCER")} type="button">
                Ver recebimentos
              </button>
            )}
            {contasAPagarAVencer.length > 0 && (
              <button onClick={() => showFinanceFilter("A_PAGAR_VENCER")} type="button">
                Ver pagamentos
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

