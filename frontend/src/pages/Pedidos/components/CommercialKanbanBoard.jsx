import { CommercialKanbanColumn } from "./CommercialKanbanColumn";

export function CommercialKanbanBoard({
  canManageCommercialFollowUp,
  commercialFunnelStages,
  startCommercialFollowUp,
}) {
  return (
    <div className="commercial-kanban-board">
      {commercialFunnelStages.map((stage) => (
        <CommercialKanbanColumn
          canManageCommercialFollowUp={canManageCommercialFollowUp}
          key={stage.key}
          stage={stage}
          startCommercialFollowUp={startCommercialFollowUp}
        />
      ))}
    </div>
  );
}
