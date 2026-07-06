import { ArrowUpRight, CheckCircle2, Loader2, Pencil } from "lucide-react";

export function FiscalConfigActions({
  checkFiscalService,
  checkingFiscalServiceConfigId,
  config,
  editFiscalConfig,
  validateFiscalConfig,
  validatingFiscalConfigId,
}) {
  return (
    <>
      <button
        className="table-icon-button"
        disabled={validatingFiscalConfigId === config.id}
        onClick={() => validateFiscalConfig(config)}
        title="Validar prontidão fiscal"
        type="button"
      >
        {validatingFiscalConfigId === config.id ? (
          <Loader2 className="spin" size={15} />
        ) : (
          <CheckCircle2 size={15} />
        )}
      </button>
      <button
        className="table-icon-button"
        disabled={checkingFiscalServiceConfigId === config.id}
        onClick={() => checkFiscalService(config)}
        title="Consultar status do serviço fiscal"
        type="button"
      >
        {checkingFiscalServiceConfigId === config.id ? (
          <Loader2 className="spin" size={15} />
        ) : (
          <ArrowUpRight size={15} />
        )}
      </button>
      <button
        className="table-icon-button"
        onClick={() => editFiscalConfig(config)}
        title="Editar configuração fiscal"
        type="button"
      >
        <Pencil size={15} />
      </button>
    </>
  );
}
