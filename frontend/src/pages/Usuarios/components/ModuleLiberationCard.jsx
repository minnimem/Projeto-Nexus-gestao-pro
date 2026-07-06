import { Loader2, ShieldCheck } from "lucide-react";
import { ModuleLiberationFields } from "./ModuleLiberationFields";

export function ModuleLiberationCard({
  canManagePlans,
  draft,
  handleReleaseSubmit,
  liberationStatuses,
  row,
  savingThisRelease,
  updateReleaseDraft,
}) {
  return (
    <article className="account-plan-item">
      <span>{row.label}</span>
      <strong>{draft.status}</strong>
      <small>
        {row.liberado
          ?
          "Liberado em produção"
          : row.liberadoPorPlano
            ?
            "Disponivel pelo plano"
            : "Aguardando liberação"}
      </small>

      <ModuleLiberationFields
        canManagePlans={canManagePlans}
        draft={draft}
        liberationStatuses={liberationStatuses}
        row={row}
        savingThisRelease={savingThisRelease}
        updateReleaseDraft={updateReleaseDraft}
      />

      {canManagePlans && (
        <button
          className="ghost-button"
          disabled={savingThisRelease}
          onClick={() => handleReleaseSubmit(row.modulo)}
          type="button"
        >
          {savingThisRelease ? <Loader2 className="spin" size={15} /> : <ShieldCheck size={15} />}
          {savingThisRelease ? "Salvando..." : "Salvar liberação"}
        </button>
      )}
    </article>
  );
}
