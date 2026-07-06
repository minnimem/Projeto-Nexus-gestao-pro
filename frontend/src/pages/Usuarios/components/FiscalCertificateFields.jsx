export function FiscalCertificateFields({ fiscalConfigForm, updateFiscalConfigForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Alias certificado</span>
        <input
          value={fiscalConfigForm.certificadoAlias}
          onChange={(event) => updateFiscalConfigForm("certificadoAlias", event.target.value)}
          placeholder="certificado-a1-matriz"
        />
      </label>
      <label className="form-control">
        <span>Senha env</span>
        <input
          value={fiscalConfigForm.certificadoSenhaEnv}
          onChange={(event) => updateFiscalConfigForm("certificadoSenhaEnv", event.target.value)}
          placeholder="FISCAL_CERT_PASSWORD"
        />
      </label>
      <label className="form-control">
        <span>Arquivo env</span>
        <input
          value={fiscalConfigForm.certificadoArquivoEnv}
          onChange={(event) => updateFiscalConfigForm("certificadoArquivoEnv", event.target.value)}
          placeholder="FISCAL_CERT_FILE"
        />
      </label>
      <label className="form-control">
        <span>Validade A1</span>
        <input
          type="date"
          value={fiscalConfigForm.certificadoValidoAte}
          onChange={(event) => updateFiscalConfigForm("certificadoValidoAte", event.target.value)}
        />
      </label>
    </div>
  );
}
