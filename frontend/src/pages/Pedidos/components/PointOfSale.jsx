import { usePointOfSaleController } from "../hooks/usePointOfSaleController";
import { PointOfSaleCatalog } from "./PointOfSaleCatalog";
import { PointOfSaleCheckout } from "./PointOfSaleCheckout";

export function PointOfSale({
  produtos,
  clientes,
  session,
  onSaleCreated,
  cashMode = false,
  caixa = null,
  canOperateCash = true,
}) {
  const {
    catalogProps,
    checkoutProps,
    formRef,
    handleSubmit,
  } = usePointOfSaleController({
    caixa,
    canOperateCash,
    cashMode,
    clientes,
    onSaleCreated,
    produtos,
    session,
  });

  return (
    <form ref={formRef} className={cashMode ? "pos-grid cash-pos-grid" : "pos-grid"} onSubmit={handleSubmit}>
      <PointOfSaleCatalog {...catalogProps} />
      <PointOfSaleCheckout {...checkoutProps} />
    </form>
  );
}
