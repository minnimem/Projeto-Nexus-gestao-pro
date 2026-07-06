import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { asList } from "../../../utils/formatters";

export function FiscalReadinessCell({ status }) {
  if (!status) {
    return <small>Validação não executada</small>;
  }

  return (
    <>
      <StatusBadge status={status.prontoHomologacao ? "PRONTA" : "PENDENTE"} />
      <small>
        {status.prontoHomologacao
          ? "Homologação liberada"
          : `${asList(status.pendencias).length} pendência(s)`}
      </small>
    </>
  );
}
