export function PointOfSaleQuoteFields({
  paymentMethod,
  quoteConditions,
  quoteValidity,
  setPaymentMethod,
  setQuoteConditions,
  setQuoteValidity,
}) {
  return (
    <>
      <label className="form-control">
        <span>Pagamento</span>
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
          <option value="PIX">Pix</option>
          <option value="DINHEIRO">Dinheiro</option>
          <option value="CARTAO_CREDITO">Cartao credito</option>
          <option value="CARTAO_DEBITO">Cartao debito</option>
          <option value="BOLETO">Boleto</option>
          <option value="MISTO">Misto</option>
        </select>
      </label>
      <label className="form-control">
        <span>Validade da proposta</span>
        <input type="date" value={quoteValidity} onChange={(event) => setQuoteValidity(event.target.value)} />
      </label>
      <label className="form-control client-picker-control">
        <span>Condicoes comerciais</span>
        <input value={quoteConditions} onChange={(event) => setQuoteConditions(event.target.value)} placeholder="Ex.: valores sujeitos a estoque e aprovação" />
      </label>
    </>
  );
}
