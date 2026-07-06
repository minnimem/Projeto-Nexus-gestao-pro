import { sectionClass } from "../../../utils/sales";
import { getCommercialFollowUpSectionProps } from "../services/commercialFollowUpSectionProps";
import { CommercialAgendaPanel } from "./CommercialAgendaPanel";
import { CommercialFollowUpForm } from "./CommercialFollowUpForm";
import { CommercialFollowUpHeader } from "./CommercialFollowUpHeader";
import { CommercialFollowUpHistory } from "./CommercialFollowUpHistory";
import { CommercialFollowUpOrdersTable } from "./CommercialFollowUpOrdersTable";
import { CommercialKanbanBoard } from "./CommercialKanbanBoard";
import { CommercialPriorityPanel } from "./CommercialPriorityPanel";
import { CommercialSellerSummary } from "./CommercialSellerSummary";

export function CommercialFollowUpSection({
  commercial,
  savingOrderAction,
  selectedSalesBranchLabel,
  showCommercialFollowUp,
}) {
  const {
    agendaProps,
    formProps,
    headerProps,
    historyProps,
    kanbanProps,
    ordersTableProps,
    priorityProps,
    sellerSummaryProps,
  } = getCommercialFollowUpSectionProps({
    commercial,
    savingOrderAction,
    selectedSalesBranchLabel,
  });

  return (
    <section className={`panel account-plan-summary${sectionClass(showCommercialFollowUp)}`}>
      <CommercialFollowUpHeader {...headerProps} />

      <CommercialPriorityPanel {...priorityProps} />

      <CommercialKanbanBoard {...kanbanProps} />

      <CommercialSellerSummary {...sellerSummaryProps} />

      <CommercialFollowUpForm {...formProps} />

      <CommercialAgendaPanel {...agendaProps} />

      <CommercialFollowUpHistory {...historyProps} />

      <CommercialFollowUpOrdersTable {...ordersTableProps} />
    </section>
  );
}
