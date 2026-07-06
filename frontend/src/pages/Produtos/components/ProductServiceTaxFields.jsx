export function ProductServiceTaxFields({ form, updateForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Serviço municipal</span>
        <input
          maxLength={20}
          value={form.codigoServicoMunicipal}
          onChange={(event) => updateForm("codigoServicoMunicipal", event.target.value)}
          placeholder="Ex.: 14.01"
        />
      </label>
      <label className="form-control">
        <span>Serviço nacional</span>
        <input
          maxLength={20}
          value={form.codigoServicoNacional}
          onChange={(event) => updateForm("codigoServicoNacional", event.target.value)}
          placeholder="Opcional"
        />
      </label>
      <label className="form-control">
        <span>ISS %</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.aliquotaIss}
          onChange={(event) => updateForm("aliquotaIss", event.target.value)}
          placeholder="0,00"
        />
      </label>
    </div>
  );
}
