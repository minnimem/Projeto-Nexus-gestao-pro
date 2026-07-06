import { ModuleLiberationCard } from "./ModuleLiberationCard";

export function ModuleLiberationPanel({
  canManagePlans,
  handleReleaseSubmit,
  liberationRows,
  liberationStatuses,
  releaseDrafts,
  savingReleaseModule,
  updateReleaseDraft,
}) {
  return (
    <div className="account-plan-grid">
      {liberationRows.map((row) => {
        const draft = releaseDrafts[row.modulo] || {
          modulo: row.modulo,
          status: row.status,
          contratado: row.contratado,
          responsavel: row.responsavel || "",
          evidência: row.evidência || "",
          observacao: row.observacao || "",
        };
        const savingThisRelease = savingReleaseModule === row.modulo;

        return (
          <ModuleLiberationCard
            canManagePlans={canManagePlans}
            draft={draft}
            handleReleaseSubmit={handleReleaseSubmit}
            key={row.modulo}
            liberationStatuses={liberationStatuses}
            row={row}
            savingThisRelease={savingThisRelease}
            updateReleaseDraft={updateReleaseDraft}
          />
        );
      })}
    </div>
  );
}
