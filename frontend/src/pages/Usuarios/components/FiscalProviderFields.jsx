export function FiscalProviderFields({ fiscalConfigForm, updateFiscalConfigForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Serie</span>
        <input
          value={fiscalConfigForm.serie}
          onChange={(event) => updateFiscalConfigForm("serie", event.target.value)}
          placeholder="1"
        />
      </label>
      <label className="form-control">
        <span>Próximo número</span>
        <input
          min="1"
          type="number"
          value={fiscalConfigForm.proximoNumero}
          onChange={(event) => updateFiscalConfigForm("proximoNumero", event.target.value)}
          placeholder="1"
        />
      </label>
      <label className="form-control">
        <span>Provedor</span>
        <input
          value={fiscalConfigForm.provedor}
          onChange={(event) => updateFiscalConfigForm("provedor", event.target.value)}
          placeholder="SEFAZ / provedor"
        />
      </label>
      <label className="form-control">
        <span>Token provedor env</span>
        <input
          value={fiscalConfigForm.provedorTokenEnv}
          onChange={(event) => updateFiscalConfigForm("provedorTokenEnv", event.target.value)}
          placeholder="FISCAL_PROVIDER_TOKEN"
        />
      </label>
    </div>
  );
}
