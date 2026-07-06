import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { FiscalConfigActions } from "./FiscalConfigActions";
import { FiscalConfigSecretsCell } from "./FiscalConfigSecretsCell";
import { FiscalReadinessCell } from "./FiscalReadinessCell";
import { FiscalServiceStatusCell } from "./FiscalServiceStatusCell";

export function FiscalConfigRow({
  checkFiscalService,
  checkingFiscalServiceConfigId,
  config,
  editFiscalConfig,
  serviceStatus,
  status,
  validateFiscalConfig,
  validatingFiscalConfigId,
}) {
  return (
    <tr>
      <td>
        <strong>{config.filialNome || "Empresa / sem filial"}</strong>
        <small>
          {[config.provedor || "Provedor não definido", config.provedorTokenEnv]
            .filter(Boolean)
            .join(" / ")}
        </small>
      </td>
      <td>
        <span className="pill">{config.modelo}</span>
      </td>
      <td>{config.ambiente}</td>
      <td>
        <strong>{config.serie || "-"}</strong>
        <small>prox. {config.proximoNumero || "-"}</small>
      </td>
      <td>
        <FiscalConfigSecretsCell config={config} />
      </td>
      <td>
        <StatusBadge status={config.ativo ? "ATIVA" : "INATIVA"} />
      </td>
      <td>
        <FiscalReadinessCell status={status} />
      </td>
      <td>
        <FiscalServiceStatusCell serviceStatus={serviceStatus} />
      </td>
      <td>
        <FiscalConfigActions
          checkFiscalService={checkFiscalService}
          checkingFiscalServiceConfigId={checkingFiscalServiceConfigId}
          config={config}
          editFiscalConfig={editFiscalConfig}
          validateFiscalConfig={validateFiscalConfig}
          validatingFiscalConfigId={validatingFiscalConfigId}
        />
      </td>
    </tr>
  );
}
