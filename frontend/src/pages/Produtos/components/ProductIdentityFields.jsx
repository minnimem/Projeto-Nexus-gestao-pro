import { Barcode } from "lucide-react";

export function ProductIdentityFields({ form, onGenerateBarcode, updateForm }) {
  return (
    <>
      <label className="form-control">
        <span>Nome</span>
        <input
          value={form.nomeProduto}
          onChange={(event) => updateForm("nomeProduto", event.target.value)}
          placeholder="Nome do produto"
        />
      </label>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Código barras</span>
          <div className="barcode-field">
            <input
              value={form.codBarras}
              onChange={(event) => updateForm("codBarras", event.target.value)}
              placeholder="Gerado automaticamente"
            />
            <button
              className="barcode-generate-button"
              onClick={onGenerateBarcode}
              title="Gerar código de barras"
              type="button"
            >
              <Barcode size={16} />
              Gerar
            </button>
          </div>
        </label>
        <label className="form-control">
          <span>SKU</span>
          <input
            value={form.sku}
            onChange={(event) => updateForm("sku", event.target.value)}
            placeholder="SKU-001"
          />
        </label>
      </div>
    </>
  );
}
