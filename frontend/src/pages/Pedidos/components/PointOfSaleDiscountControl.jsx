export function PointOfSaleDiscountControl({
  discount,
  discountAmount,
  discountMode,
  setDiscount,
  setDiscountAmount,
  setDiscountMode,
}) {
  return (
    <div className="form-control discount-control">
      <span>Desconto</span>
      <div className="discount-mode-switch" role="group" aria-label="Tipo de desconto">
        <button className={discountMode === "percent" ? "active" : ""} onClick={() => setDiscountMode("percent")} type="button">%</button>
        <button className={discountMode === "amount" ? "active" : ""} onClick={() => setDiscountMode("amount")} type="button">R$</button>
      </div>
      {discountMode === "percent" ? (
        <input max="100" min="0" type="number" value={discount} onChange={(event) => setDiscount(Math.min(100, Number(event.target.value || 0)))} />
      ) : (
        <input inputMode="decimal" min="0" type="text" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} placeholder="0,00" />
      )}
    </div>
  );
}
