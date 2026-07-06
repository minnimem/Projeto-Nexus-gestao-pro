import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import { downloadCsv, downloadExcel, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function SellerRankingHeader({
  canManageCommission,
  commissionRateInput,
  handleSaveCommissionConfig,
  savingOrderAction,
  sellerCommissionRows,
  setCommissionRateInput,
}) {
  return (
    <div className="account-plan-head">
      <div>
        <h3>Ranking por vendedor</h3>
        <p>Metas, comissão e período customizado sobre vendas concluídas.</p>
      </div>
      <div className="account-plan-actions">
        {canManageCommission && (
          <>
            <label className="commission-config-control">
              <span>Comissão (%)</span>
              <input
                min="0"
                max="100"
                step="0.01"
                type="number"
                value={commissionRateInput}
                onChange={(event) => setCommissionRateInput(event.target.value)}
                title="Percentual de comissão"
              />
            </label>
            <button
              disabled={savingOrderAction === "commission-config"}
              onClick={handleSaveCommissionConfig}
              type="button"
            >
              {savingOrderAction === "commission-config" ? "Salvando..." : "Salvar %"}
            </button>
          </>
        )}
        {renderExportActionGroup({
          disabled: sellerCommissionRows.length === 0,
          onCsv: () => downloadCsv(`nexus-one-ranking-vendedores-${getLocalDateKey()}.csv`, sellerCommissionRows),
          onPdf: () => printRowsDocument("Ranking por vendedor", sellerCommissionRows, "Nexus One"),
          onExcel: () => downloadExcel(
            `nexus-one-ranking-vendedores-${getLocalDateKey()}.xls`,
            sellerCommissionRows,
            "Ranking por vendedor",
          ),
        })}
      </div>
    </div>
  );
}
