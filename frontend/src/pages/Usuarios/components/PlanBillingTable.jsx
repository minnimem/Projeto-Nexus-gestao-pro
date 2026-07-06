import { PlanBillingRow } from "./PlanBillingRow";

export function PlanBillingTable({
  copyPlanBillingMessage,
  handlePlanBillingStatusChange,
  planBillingFilteredItems,
  planBillingNotes,
  savePlanBillingNote,
  savingBillingCompanyId,
  selectedPlanBillingIds,
  togglePlanBillingSelection,
  updatePlanBillingNote,
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Empresa</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {planBillingFilteredItems.length === 0 ? (
            <tr>
              <td className="empty-cell" colSpan="7">Nenhuma assinatura neste filtro.</td>
            </tr>
          ) : (
            planBillingFilteredItems.map((item) => (
              <PlanBillingRow
                copyPlanBillingMessage={copyPlanBillingMessage}
                handlePlanBillingStatusChange={handlePlanBillingStatusChange}
                item={item}
                key={item.id || item.nome}
                planBillingNotes={planBillingNotes}
                savePlanBillingNote={savePlanBillingNote}
                savingBillingCompanyId={savingBillingCompanyId}
                selectedPlanBillingIds={selectedPlanBillingIds}
                togglePlanBillingSelection={togglePlanBillingSelection}
                updatePlanBillingNote={updatePlanBillingNote}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
