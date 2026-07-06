export function FiscalIdentityFields({ filiais, fiscalConfigForm, updateFiscalConfigForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Unidade</span>
        <select
          value={fiscalConfigForm.filialId}
          onChange={(event) => updateFiscalConfigForm("filialId", event.target.value)}
        >
          <option value="">Empresa / sem filial</option>
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="form-control">
        <span>Modelo</span>
        <select
          value={fiscalConfigForm.modelo}
          onChange={(event) => updateFiscalConfigForm("modelo", event.target.value)}
        >
          <option value="NFE">NF-e</option>
          <option value="NFCE">NFC-e</option>
          <option value="NFSE">NFS-e</option>
        </select>
      </label>
      <label className="form-control">
        <span>Ambiente</span>
        <select
          value={fiscalConfigForm.ambiente}
          onChange={(event) => updateFiscalConfigForm("ambiente", event.target.value)}
        >
          <option value="HOMOLOGACAO">Homologação</option>
          <option value="PRODUCAO">Producao</option>
        </select>
      </label>
    </div>
  );
}
