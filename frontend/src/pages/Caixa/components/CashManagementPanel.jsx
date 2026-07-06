import { CheckCircle2, FileText, WalletCards } from "lucide-react";
import { formatDate } from "../../../utils/formatters";
import { CashCloseForm } from "./CashCloseForm";
import { CashMovementForm } from "./CashMovementForm";
import { CashOpenForm } from "./CashOpenForm";
import { CashPaymentReportPanel } from "./CashPaymentReportPanel";

export function CashManagementPanel({
  caixa,
  canOperate,
  cashAction,
  closeConciliationRows,
  closeDifference,
  closeDifferenceOk,
  closeForm,
  handleCloseCash,
  handleMovement,
  handleOpenCash,
  movementForm,
  openForm,
  paymentReportRows,
  paymentReportTotal,
  saving,
  setCashAction,
  setCloseForm,
  setMovementForm,
  setOpenForm,
  todayPaymentMovements,
}) {
  return (
    <section className="dashboard-grid">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>{caixa ? "Caixa aberto" : "Abrir caixa"}</h2>
            <p>{caixa ? "Operador, perfil e saldos do turno atual." : "Informe o valor inicial para começar."}</p>
          </div>
          <span className={caixa.dataAbertura ? "cash-title-date" : "cash-title-waiting"}>
            {caixa.dataAbertura ? formatDate(caixa.dataAbertura) : "Aguardando"}
          </span>
        </div>

        {caixa ? (
          <div className="health-list">
            <div>
              <span>Operador</span>
              <strong>{caixa.usuarioNome || caixa.usuarioLogin}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{caixa.perfil}</strong>
            </div>
            <div>
              <span>Empresa</span>
              <strong>{caixa.empresaNome || caixa.empresaId}</strong>
            </div>
            <div>
              <span>Abertura</span>
              <strong>{new Date(caixa.dataAbertura).toLocaleString("pt-BR")}</strong>
            </div>
          </div>
        ) : (
          <CashOpenForm
            canOperate={canOperate}
            onOpenCash={handleOpenCash}
            openForm={openForm}
            saving={saving}
            setOpenForm={setOpenForm}
          />
        )}
      </article>

      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Movimentação</h2>
            <p>Use os botões para registrar sangria, suprimento ou fechamento.</p>
          </div>
        </div>

        {caixa && canOperate ? (
          <>
            <div className="cash-action-buttons">
              <button
                className={cashAction === "movimento" ? "active" : ""}
                onClick={() => setCashAction((current) => current === "movimento" ? "" : "movimento")}
                type="button"
              >
                <WalletCards size={18} />
                Movimentar caixa
              </button>
              <button
                className={cashAction === "relatorio" ? "active" : ""}
                onClick={() => setCashAction((current) => current === "relatorio" ? "" : "relatorio")}
                type="button"
              >
                <FileText size={18} />
                Relatório do dia
              </button>
              <button
                className={cashAction === "fechamento" ? "active" : ""}
                onClick={() => setCashAction((current) => current === "fechamento" ? "" : "fechamento")}
                type="button"
              >
                <CheckCircle2 size={18} />
                Fechar caixa
              </button>
            </div>
            {cashAction === "movimento" && (
              <CashMovementForm
                movementForm={movementForm}
                onMovement={handleMovement}
                saving={saving}
                setMovementForm={setMovementForm}
              />
            )}

            {cashAction === "relatorio" && (
              <CashPaymentReportPanel
                paymentReportRows={paymentReportRows}
                paymentReportTotal={paymentReportTotal}
                todayPaymentMovements={todayPaymentMovements}
              />
            )}
            {cashAction === "fechamento" && (
              <CashCloseForm
                closeConciliationRows={closeConciliationRows}
                closeDifference={closeDifference}
                closeDifferenceOk={closeDifferenceOk}
                closeForm={closeForm}
                onCloseCash={handleCloseCash}
                saving={saving}
                setCloseForm={setCloseForm}
              />
            )}
          </>
        ) : (
          <div className="empty-cell">
            {canOperate ? "Abra um caixa para registrar movimentos." : "Seu perfil visualiza o caixa, mas não opera movimentos."}
          </div>
        )}
      </article>
    </section>
  );
}
