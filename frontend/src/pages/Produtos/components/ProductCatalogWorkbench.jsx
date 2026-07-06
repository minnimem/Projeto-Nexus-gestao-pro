import { ProductCreateForm } from "./ProductCreateForm";
import { ProductSupplierForm } from "./ProductSupplierForm";
import { ProductTaxonomyForm } from "./ProductTaxonomyForm";
import "./ProductInventoryWorkbench.css";

export function ProductCatalogWorkbench({
  brand,
  category,
  product,
  supplier,
}) {
  return (
    <>
      {product.visible && (
        <ProductCreateForm
          categorias={product.categories}
          fornecedores={product.suppliers}
          form={product.form}
          marcas={product.brands}
          message={product.message}
          onCreateBrand={brand.open}
          onCreateCategory={category.open}
          onCreateSupplier={supplier.open}
          onGenerateBarcode={product.onGenerateBarcode}
          onClose={product.onClose}
          onSubmit={product.onSubmit}
          saving={product.saving}
          updateForm={product.updateForm}
        />
      )}

      {category.visible && (
        <ProductTaxonomyForm
          buttonLabel="Salvar categoria"
          description="Cadastro usado para classificar produtos."
          descriptionPlaceholder="Uso interno da categoria"
          form={category.form}
          namePlaceholder="Ex.: Bebidas, Limpeza, Eletrônicos"
          onClose={category.onClose}
          onSubmit={category.onSubmit}
          saving={category.saving}
          setForm={category.setForm}
          title="Nova categoria"
        />
      )}

      {brand.visible && (
        <ProductTaxonomyForm
          buttonLabel="Salvar marca"
          description="Cadastro usado no produto e nos relatórios."
          descriptionPlaceholder="Observação interna"
          form={brand.form}
          namePlaceholder="Marca"
          onClose={brand.onClose}
          onSubmit={brand.onSubmit}
          saving={brand.saving}
          setForm={brand.setForm}
          title="Nova marca"
        />
      )}

      {supplier.visible && (
        <ProductSupplierForm
          form={supplier.form}
          onClose={supplier.onClose}
          onSubmit={supplier.onSubmit}
          saving={supplier.saving}
          setForm={supplier.setForm}
        />
      )}
    </>
  );
}
