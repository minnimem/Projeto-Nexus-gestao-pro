import { CommercialFollowUpHistoryCard } from "./CommercialFollowUpHistoryCard";
import { CommercialFollowUpHistoryHeader } from "./CommercialFollowUpHistoryHeader";

export function CommercialFollowUpHistory({
  branchScopedCommercialFollowUps,
  canManageCommercialFollowUp,
  commercialFollowUpHistoryRows,
  dueCommercialFollowUps,
  handleCommercialFollowUpStatus,
  pendingCommercialFollowUps,
  savingOrderAction,
}) {
  if (branchScopedCommercialFollowUps.length === 0) return null;

  return (
    <div className="commercial-followup-history">
      <CommercialFollowUpHistoryHeader
        commercialFollowUpHistoryRows={commercialFollowUpHistoryRows}
        dueCommercialFollowUps={dueCommercialFollowUps}
        pendingCommercialFollowUps={pendingCommercialFollowUps}
      />
      <div className="account-plan-grid commercial-followup-grid">
        {branchScopedCommercialFollowUps.slice(0, 4).map((item) => (
          <CommercialFollowUpHistoryCard
            canManageCommercialFollowUp={canManageCommercialFollowUp}
            handleCommercialFollowUpStatus={handleCommercialFollowUpStatus}
            item={item}
            key={item.id}
            savingOrderAction={savingOrderAction}
          />
        ))}
      </div>
    </div>
  );
}
