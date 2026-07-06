import {
  CheckCircle2,
  CircleDollarSign,
  Copy,
  FileText,
  Loader2,
  LockKeyhole,
} from "lucide-react";

export function PlanBillingActions({
  copyPlanBillingMessage,
  handlePlanBillingStatusChange,
  item,
  note,
  savePlanBillingNote,
  savingThisCompany,
}) {
  return (
    <div className="table-actions">
      <button
        disabled={savingThisCompany}
        onClick={() => copyPlanBillingMessage(item)}
        type="button"
      >
        <Copy size={14} />
        Copiar
      </button>
      <button
        disabled={savingThisCompany}
        onClick={() =>
          handlePlanBillingStatusChange(
            item,
            "PENDENTE",
            "Marcado para cobrança pelo painel master.",
          )
        }
        type="button"
      >
        {savingThisCompany ? <Loader2 className="spin" size={14} /> : <CircleDollarSign size={14} />}
        Cobrar
      </button>
      <button
        disabled={savingThisCompany}
        onClick={() =>
          handlePlanBillingStatusChange(
            item,
            "SUSPENSA",
            "Assinatura suspensa por pendência de cobrança.",
          )
        }
        type="button"
      >
        <LockKeyhole size={14} />
        Suspender
      </button>
      <button
        disabled={savingThisCompany}
        onClick={() =>
          handlePlanBillingStatusChange(
            item,
            "ATIVA",
            "Assinatura regularizada pelo painel master.",
          )
        }
        type="button"
      >
        <CheckCircle2 size={14} />
        Regularizar
      </button>
      <button
        disabled={savingThisCompany || !String(note || "").trim()}
        onClick={() => savePlanBillingNote(item)}
        type="button"
      >
        {savingThisCompany ? <Loader2 className="spin" size={14} /> : <FileText size={14} />}
        Registrar
      </button>
    </div>
  );
}
