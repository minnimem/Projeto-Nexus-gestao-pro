import { ProductInventoryCountForm } from "./ProductInventoryCountForm";
import { ProductLabelsSection } from "./ProductLabelsSection";
import { ProductStockAdjustmentForm } from "./ProductStockAdjustmentForm";
import { ProductStockAlertsSection } from "./ProductStockAlertsSection";
import { ProductStockTransferForm } from "./ProductStockTransferForm";
import "./ProductInventoryWorkbench.css";

export function ProductStockOperationsWorkbench({
  activeTool,
  adjustment,
  alerts,
  companyName,
  count,
  labels,
  transfer,
}) {
  return (
    <>
      {activeTool === "labels" && (
        <ProductLabelsSection
          companyName={companyName}
          filteredProducts={labels.products}
          labelPreviewProduct={labels.previewProduct}
          setLabelPreviewProductId={labels.setPreviewProductId}
        />
      )}

      {activeTool === "count" && (
        <ProductInventoryCountForm
          form={count.form}
          inventoryDifference={count.difference}
          onSubmit={count.onSubmit}
          produtos={count.products}
          saving={count.saving}
          selectedProduct={count.selectedProduct}
          setForm={count.setForm}
        />
      )}

      {activeTool === "transfer" && (
        <ProductStockTransferForm
          companyName={companyName}
          form={transfer.form}
          onSubmit={transfer.onSubmit}
          produtos={transfer.products}
          saving={transfer.saving}
          selectedOriginStock={transfer.selectedOriginStock}
          selectedProduct={transfer.selectedProduct}
          setForm={transfer.setForm}
          stockLocationRows={transfer.stockLocationRows}
          transferLocations={transfer.locations}
        />
      )}

      {activeTool === "adjustment" && (
        <ProductStockAdjustmentForm
          adjustment={adjustment.form}
          message={adjustment.message}
          onSubmit={adjustment.onSubmit}
          saving={adjustment.saving}
          selectedProduct={adjustment.selectedProduct}
          setAdjustment={adjustment.setForm}
          setStockProductSearch={adjustment.setSearch}
          stockProductSearch={adjustment.search}
          stockSearchResults={adjustment.searchResults}
        />
      )}

      {activeTool === "alerts" && (
        <ProductStockAlertsSection
          canManageNotifications={alerts.canManageNotifications}
          estoqueBaixo={alerts.lowStockProducts}
          onSendNotifications={alerts.onSendNotifications}
          saving={alerts.saving}
        />
      )}
    </>
  );
}
