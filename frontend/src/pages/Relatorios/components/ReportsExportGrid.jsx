import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber } from "../../../utils/formatters";

export function ReportsExportGrid({
  getReportFieldKeys,
  getSelectedReportFields,
  getSelectedReportRows,
  reportCards,
  session,
  setReportFieldPreset,
  toggleReportField,
  totalRegistros,
}) {
  return (
    <>
      <section className="reports-grid">
        {reportCards.map((card) => {
          const Icon = card.icon;
          const fieldKeys = getReportFieldKeys(card);
          const selectedFields = getSelectedReportFields(card);
          const selectedRows = getSelectedReportRows(card);
          return (
            <article className="panel report-card" key={card.key}>
              <div className="report-card-head">
                <div className="preview-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <h2>{card.title}</h2>
                  <p>{card.detail}</p>
                </div>
              </div>

              <div className="report-card-stat">
                <span>Registros</span>
                <strong>{formatNumber(card.count)}</strong>
                <small>{formatNumber(selectedFields.length)} de {formatNumber(fieldKeys.length)} campo(s)</small>
              </div>

              <div className="report-field-picker">
                <div className="report-field-picker-head">
                  <span>Campos</span>
                  <div>
                    <button onClick={() => setReportFieldPreset(card.key, "all")} type="button">Todos</button>
                    <button onClick={() => setReportFieldPreset(card.key, "essential")} type="button">Essenciais</button>
                  </div>
                </div>
                <div>
                  {fieldKeys.slice(0, 8).map((field) => (
                    <label key={field}>
                      <input
                        checked={selectedFields.includes(field)}
                        disabled={fieldKeys.length === 0}
                        onChange={() => toggleReportField(card.key, field)}
                        type="checkbox"
                      />
                      {field}
                    </label>
                  ))}
                  {fieldKeys.length > 8 && <small>+ {formatNumber(fieldKeys.length - 8)} campo(s)</small>}
                </div>
              </div>

              <div className="report-actions">
                <button
                  className="report-export"
                  disabled={card.rows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-${card.key}.csv`, selectedRows)}
                  type="button"
                >
                  <Download size={17} />
                  CSV
                </button>
                <button
                  className="report-export secondary"
                  disabled={card.rows.length === 0}
                  onClick={() => printRowsDocument(`Relatório ${card.title}`, selectedRows, session.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={17} />
                  PDF
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Resumo dos dados</h2>
            <p>Leitura unificada dos endpoints permitidos para este perfil.</p>
          </div>
          <span>{formatNumber(totalRegistros)} registros</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Área</th>
                <th>Registros</th>
                <th>Status</th>
                <th>Exportação</th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map((card) => (
                <tr key={card.key}>
                  <td>
                    <strong>{card.title}</strong>
                    <small>{card.detail}</small>
                  </td>
                  <td>{formatNumber(card.count)}</td>
                  <td>
                    <StatusBadge status={card.count > 0 ? "COM_DADOS" : "PENDENTE"} label={card.count > 0 ? "Com dados" : "Vazio"} />
                  </td>
                  <td>{card.rows.length > 0 ? "CSV disponível" : "Sem dados"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
