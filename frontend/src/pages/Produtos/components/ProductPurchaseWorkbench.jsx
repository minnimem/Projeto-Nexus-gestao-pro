import { ProductPurchaseForm } from "./ProductPurchaseForm";
import { ProductPurchaseHistorySection } from "./ProductPurchaseHistorySection";
import "./ProductInventoryWorkbench.css";

export function ProductPurchaseWorkbench({
  activeTool,
  companyName,
  entry,
  history,
}) {
  return (
    <>
      {activeTool === "purchase" && (
        <ProductPurchaseForm
          fornecedores={entry.suppliers}
          form={entry.form}
          onAddItem={entry.onAddItem}
          onRemoveItem={entry.onRemoveItem}
          onSubmit={entry.onSubmit}
          produtos={entry.products}
          purchaseItems={entry.items}
          purchaseTotal={entry.total}
          saving={entry.saving}
          selectedProduct={entry.selectedProduct}
          selectedProductCost={entry.selectedProductCost}
          selectedSupplier={entry.selectedSupplier}
          setForm={entry.setForm}
        />
      )}

      {activeTool === "history" && (
        <ProductPurchaseHistorySection
          companyName={companyName}
          compras={history.purchases}
          purchaseHistoryRows={history.rows}
          selectedInventoryBranchLabel={history.branchLabel}
        />
      )}
    </>
  );
}
