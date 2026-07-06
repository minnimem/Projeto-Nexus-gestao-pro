import { Loader2, Plus } from "lucide-react";
import { serviceOrderFlowSteps } from "../constants/serviceConstants";

export function ServiceOrderFlowActions({
  clientes,
  formStep,
  goToNextServiceStep,
  goToPreviousServiceStep,
  saving,
}) {
  return (
    <div className="service-flow-actions">
      <button disabled={formStep === serviceOrderFlowSteps[0].key} onClick={goToPreviousServiceStep} type="button">
        Voltar
      </button>
      {formStep === "finalizar" ? (
        <button className="checkout-button" disabled={saving || clientes.length === 0} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
          {saving ? "Abrindo..." : "Abrir OS"}
        </button>
      ) : (
        <button className="checkout-button" onClick={goToNextServiceStep} type="button">
          Próximo
        </button>
      )}
    </div>
  );
}
