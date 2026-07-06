import { formatNumber } from "../../../utils/formatters";
import { sectionClass } from "../../../utils/sales";
import { useSeparationQueue } from "../hooks/useSeparationQueue";
import "../styles/separation.css";
import { SeparationFilterSummary } from "./SeparationFilterSummary";
import { SeparationOrdersTable } from "./SeparationOrdersTable";
import { SeparationStageSummary } from "./SeparationStageSummary";
import { SeparationToolbar } from "./SeparationToolbar";

export function SalesSeparationSection({
  handlePrintFiscalMirror,
  handleSeparationAction,
  orderMessage,
  savingOrderAction,
  separationOrders,
  showSalesSeparation,
}) {
  const queue = useSeparationQueue(separationOrders);

  return (
    <section className={`panel account-plan-summary${sectionClass(showSalesSeparation)}`}>
      <div className="account-plan-head">
        <div>
          <h3>Separação de pedidos</h3>
          <p>Fila operacional de estoque, retirada e despacho.</p>
        </div>
        <span className="operation-chip">{formatNumber(separationOrders.length)} em acompanhamento</span>
      </div>

      <SeparationStageSummary
        stageCounts={queue.stageCounts}
        stageFilter={queue.stageFilter}
        toggleStage={queue.toggleStage}
      />

      <SeparationToolbar queue={queue} />

      <SeparationFilterSummary
        filteredOrders={queue.filteredOrders}
        filteredTotal={queue.filteredTotal}
      />
      {orderMessage && <p className={`form-message ${orderMessage.type}`}>{orderMessage.text}</p>}

      <SeparationOrdersTable
        filteredOrders={queue.filteredOrders}
        handlePrintFiscalMirror={handlePrintFiscalMirror}
        handleSeparationAction={handleSeparationAction}
        savingOrderAction={savingOrderAction}
      />
    </section>
  );
}
