import { CommercialFollowUpActionsBar } from "./CommercialFollowUpActionsBar";
import { CommercialFunnelGrid } from "./CommercialFunnelGrid";

export function CommercialFollowUpHeader({
  commercialFollowUpRows,
  commercialFunnelStages,
  commercialSellerFilter,
  commercialSellerOptions,
  setCommercialSellerFilter,
}) {
  return (
    <>
      <div className="account-plan-head">
        <div>
          <h3>Follow-up comercial</h3>
          <p>Orçamentos e pedidos em aberto organizados por vendedor.</p>
        </div>
        <CommercialFollowUpActionsBar
          commercialFollowUpRows={commercialFollowUpRows}
          commercialSellerFilter={commercialSellerFilter}
          commercialSellerOptions={commercialSellerOptions}
          setCommercialSellerFilter={setCommercialSellerFilter}
        />
      </div>

      <CommercialFunnelGrid commercialFunnelStages={commercialFunnelStages} />
    </>
  );
}
