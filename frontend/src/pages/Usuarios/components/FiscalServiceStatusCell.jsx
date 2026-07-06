import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { asList } from "../../../utils/formatters";

export function FiscalServiceStatusCell({ serviceStatus }) {
  if (!serviceStatus) {
    return <small>Não consultado</small>;
  }

  return (
    <>
      <StatusBadge status={serviceStatus.disponivel ? "ONLINE" : "BLOQ"} />
      <small>
        {serviceStatus.disponivel
          ? serviceStatus.endpoint || "Endpoint ok"
          : `${asList(serviceStatus.pendencias).length} pendencia(s)`}
      </small>
    </>
  );
}
