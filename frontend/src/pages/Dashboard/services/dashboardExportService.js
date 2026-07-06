import { periodPresets } from "../../../constants/modules";
import { downloadTextFile } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function exportDashboardSnapshot({
  active,
  activeModule,
  activePeriodRange,
  data,
  lastUpdatedAt,
  periodPreset,
  session,
  status,
}) {
  const payload = {
    modulo: activeModule.label || active,
    geradoEm: new Date().toISOString(),
    atualizadoEm: lastUpdatedAt ? lastUpdatedAt.toISOString() : null,
    usuario: session.usuario || session.login,
    empresaId: session.empresaId || null,
    período: {
      preset: periodPresets[periodPreset],
      inicio: activePeriodRange.startKey,
      fim: activePeriodRange.endKey,
    },
    status,
    dados: data,
  };

  downloadTextFile(
    `nexus-one-${activeModule.value || active}-${getLocalDateKey()}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}
