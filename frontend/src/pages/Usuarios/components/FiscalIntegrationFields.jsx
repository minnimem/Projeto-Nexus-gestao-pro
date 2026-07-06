export function FiscalIntegrationFields({ fiscalConfigForm, updateFiscalConfigForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>CSC id</span>
          <input
            value={fiscalConfigForm.cscId}
            onChange={(event) => updateFiscalConfigForm("cscId", event.target.value)}
            placeholder="000001"
          />
        </label>
        <label className="form-control">
          <span>CSC token env</span>
          <input
            value={fiscalConfigForm.cscTokenEnv}
            onChange={(event) => updateFiscalConfigForm("cscTokenEnv", event.target.value)}
            placeholder="FISCAL_NFCE_CSC_TOKEN"
          />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Endpoint homologação</span>
          <input
            value={fiscalConfigForm.endpointHomologacao}
            onChange={(event) => updateFiscalConfigForm("endpointHomologacao", event.target.value)}
            placeholder="https://homologação..."
          />
        </label>
        <label className="form-control">
          <span>Endpoint produção</span>
          <input
            value={fiscalConfigForm.endpointProducao}
            onChange={(event) => updateFiscalConfigForm("endpointProducao", event.target.value)}
            placeholder="https://produção..."
          />
        </label>
      </div>
    </>
  );
}
