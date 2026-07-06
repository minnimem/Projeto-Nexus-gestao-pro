import { Loader2, Plus } from "lucide-react";

export function CashOpenForm({
  canOperate,
  onOpenCash,
  openForm,
  saving,
  setOpenForm,
}) {
  return (
    <form className="stack-form" onSubmit={onOpenCash}>
      <label>
        <span>Valor inicial</span>
        <input
          min="0"
          inputMode="decimal"
          type="text"
          value={openForm.valorInicial}
          onChange={(event) => setOpenForm((prev) => ({ ...prev, valorInicial: event.target.value }))}
          disabled={!canOperate}
        />
      </label>
      <label>
        <span>Observação</span>
        <textarea
          value={openForm.observacao}
          onChange={(event) => setOpenForm((prev) => ({ ...prev, observacao: event.target.value }))}
          disabled={!canOperate}
        />
      </label>
      <button disabled={!canOperate || saving === "abrir"} type="submit">
        {saving === "abrir" ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
        Abrir caixa
      </button>
    </form>
  );
}
