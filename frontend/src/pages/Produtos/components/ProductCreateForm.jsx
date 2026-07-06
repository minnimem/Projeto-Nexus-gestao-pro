import { Loader2, Plus, X } from "lucide-react";
import { ProductClassificationFields } from "./ProductClassificationFields";
import { ProductCommercialFields } from "./ProductCommercialFields";
import { ProductFiscalIdentityFields } from "./ProductFiscalIdentityFields";
import { ProductIdentityFields } from "./ProductIdentityFields";
import { ProductServiceTaxFields } from "./ProductServiceTaxFields";
import { ProductTaxRateFields } from "./ProductTaxRateFields";

import "./ProductStockForm.css";

export function ProductCreateForm({
  categorias,
  fornecedores,
  form,
  marcas,
  message,
  onClose,
  onCreateBrand,
  onCreateCategory,
  onCreateSupplier,
  onGenerateBarcode,
  onSubmit,
  saving,
  updateForm,
}) {
  return (
    <div className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Novo produto</h2>
          <p>Cadastro comercial conectado ao /produtos.</p>
        </div>
        <button className="modal-close" onClick={onClose} title="Fechar" type="button">
          <X size={18} />
        </button>
      </div>

      <form className="compact-form product-form" onSubmit={onSubmit}>
        <ProductIdentityFields form={form} onGenerateBarcode={onGenerateBarcode} updateForm={updateForm} />
        <ProductFiscalIdentityFields form={form} updateForm={updateForm} />
        <ProductTaxRateFields form={form} updateForm={updateForm} />
        <ProductServiceTaxFields form={form} updateForm={updateForm} />
        <ProductClassificationFields
          categorias={categorias}
          fornecedores={fornecedores}
          form={form}
          marcas={marcas}
          onCreateBrand={onCreateBrand}
          onCreateCategory={onCreateCategory}
          onCreateSupplier={onCreateSupplier}
          updateForm={updateForm}
        />
        <ProductCommercialFields form={form} updateForm={updateForm} />

        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
          {saving ? "Salvando..." : "Salvar produto"}
        </button>
      </form>
    </div>
  );
}
