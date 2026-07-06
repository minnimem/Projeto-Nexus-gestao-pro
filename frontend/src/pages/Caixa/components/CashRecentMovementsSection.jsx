import { CreditCard, Download, Printer } from "lucide-react";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { asList, formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getMixedPaymentObservation } from "../../../utils/payments";

export function CashRecentMovementsSection({
  caixa,
  cashMovementRows,
  session,
}) {
  const movements = asList(caixa.movimentos);

  return (
    <section className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Movimentos recentes</h2>
          <p>Últimas operações do caixa aberto.</p>
        </div>
        <div className="report-actions">
          <span>{formatNumber(movements.length)} registros</span>
          <button
            className="report-export"
            disabled={cashMovementRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-movimentos-caixa-${caixa.id || getLocalDateKey()}.csv`, cashMovementRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={cashMovementRows.length === 0}
            onClick={() => printRowsDocument("Movimentos do caixa", cashMovementRows, caixa.empresaNome || session.empresa || "Nexus One")}
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
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Operador</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <TableEmptyState
                colSpan="4"
                icon={CreditCard}
                title="Nenhum movimento registrado"
                detail="Recebimentos, sangrias e suprimentos aparecem aqui durante o turno."
              />
            ) : (
              movements.map((movimento) => {
                const mixedPaymentObservation = getMixedPaymentObservation(movimento.observacao);
                return (
                  <tr key={movimento.id}>
                    <td>{movimento.tipo}</td>
                    <td>
                      {movimento.descricao}
                      {mixedPaymentObservation && (
                        <small className="payment-detail-line">Pagamento misto: {mixedPaymentObservation}</small>
                      )}
                    </td>
                    <td>{movimento.usuarioNome}</td>
                    <td>{formatCurrency(movimento.valor)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
