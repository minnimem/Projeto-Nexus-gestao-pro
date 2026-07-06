const taxFields = [
  { field: "aliquotaIcms", label: "ICMS %" },
  { field: "aliquotaPis", label: "PIS %" },
  { field: "aliquotaCofins", label: "COFINS %" },
  { field: "aliquotaIpi", label: "IPI %" },
];

export function ProductTaxRateFields({ form, updateForm }) {
  return (
    <div className="finance-form-row">
      {taxFields.map(({ field, label }) => (
        <label className="form-control" key={field}>
          <span>{label}</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form[field]}
            onChange={(event) => updateForm(field, event.target.value)}
            placeholder="0,00"
          />
        </label>
      ))}
    </div>
  );
}
