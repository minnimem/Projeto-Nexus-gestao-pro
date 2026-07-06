import { Download, Printer, X } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SalesPeriodReport({
  filiais,
  reportBranchFilter,
  salesReportCount,
  salesReportFilter,
  salesReportOptions,
  salesReportPeriod,
  salesReportRows,
  salesReportTotal,
  session,
  setReportBranchFilter,
  setSalesReportFilter,
  setSalesReportPeriod,
}) {
  return (
    <section className="panel sales-period-report">
      <div className="panel-title">
        <div>
          <h2>Relatório de vendas</h2>
          <p>Resumo diário, semanal ou mensal das vendas recebidas.</p>
        </div>
        <div className="chart-tabs compact-tabs" aria-label="Período do relatório de vendas">
          {salesReportOptions.map((option) => (
            <button
              className={salesReportPeriod === option.value ? "active" : ""}
              key={option.value}
              onClick={() => setSalesReportPeriod(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sales-period-filter">
        <label>
          <span>Filial</span>
          <select
            value={reportBranchFilter}
            onChange={(event) => setReportBranchFilter(event.target.value)}
          >
            <option value="TODAS">Todas as filiais</option>
            <option value="EMPRESA">Empresa / sem filial</option>
            {filiais.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Início</span>
          <input
            type="date"
            value={salesReportFilter.inicio}
            onChange={(event) =>
              setSalesReportFilter((current) => ({ ...current, inicio: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Fim</span>
          <input
            type="date"
            value={salesReportFilter.fim}
            onChange={(event) =>
              setSalesReportFilter((current) => ({ ...current, fim: event.target.value }))
            }
          />
        </label>
        <button
          disabled={!salesReportFilter.inicio && !salesReportFilter.fim}
          onClick={() => setSalesReportFilter({ inicio: "", fim: "" })}
          type="button"
        >
          <X size={16} />
          Limpar período
        </button>
      </div>

      <div className="sales-period-summary">
        <div>
          <span>Total recebido</span>
          <strong>{formatCurrency(salesReportTotal)}</strong>
        </div>
        <div>
          <span>Vendas</span>
          <strong>{formatNumber(salesReportCount)}</strong>
        </div>
        <div className="report-actions">
          <button
            className="report-export"
            disabled={salesReportRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-vendas-${salesReportPeriod}.csv`, salesReportRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={salesReportRows.length === 0}
            onClick={() =>
              printRowsDocument(`Relatório de vendas ${salesReportPeriod}`, salesReportRows, session.empresa || "Nexus One")
            }
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Vendas</th>
              <th>Total</th>
              <th>Formas de pagamento</th>
            </tr>
          </thead>
          <tbody>
            {salesReportRows.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-cell">
                  Nenhuma venda recebida para montar o relatório.
                </td>
              </tr>
            ) : (
              salesReportRows.map((row) => (
                <tr key={row.Periodo}>
                  <td>{row.Periodo}</td>
                  <td>{formatNumber(row.vendas)}</td>
                  <td>{formatCurrency(row.total)}</td>
                  <td>{row.formasPagamento || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
