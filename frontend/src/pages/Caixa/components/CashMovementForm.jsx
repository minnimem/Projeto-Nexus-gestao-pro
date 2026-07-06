import { Loader2, Plus } from "lucide-react";
import { canInstallmentPayment } from "../../../utils/payments";

export function CashMovementForm({
  movementForm,
  onMovement,
  saving,
  setMovementForm,
}) {
  return (
    <form className="stack-form cash-action-form" onSubmit={onMovement}>
      <label>
        <span>Tipo</span>
        <select
          value={movementForm.tipo}
          onChange={(event) => setMovementForm((prev) => ({ ...prev, tipo: event.target.value }))}
        >
          <option value="pagamentoRecebido">Pagamento recebido</option>
          <option value="suprimento">Suprimento</option>
          <option value="sangria">Sangria</option>
        </select>
      </label>
      {movementForm.tipo === "pagamentoRecebido" && (
        <label>
          <span>Forma de pagamento</span>
          <select
            value={movementForm.metodoPagamento}
            onChange={(event) =>
              setMovementForm((prev) => ({
                ...prev,
                metodoPagamento: event.target.value,
                parcelas: canInstallmentPayment(event.target.value) ? prev.parcelas : 1,
              }))
            }
          >
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO_CREDITO">Cartão de crédito</option>
            <option value="CARTAO_DEBITO">Cartão de débito</option>
            <option value="BOLETO">Boleto</option>
            <option value="MISTO">Misto</option>
          </select>
        </label>
      )}
      {movementForm.tipo === "pagamentoRecebido" && canInstallmentPayment(movementForm.metodoPagamento) && (
        <label>
          <span>Parcelas</span>
          <select
            value={movementForm.parcelas}
            onChange={(event) =>
              setMovementForm((prev) => ({ ...prev, parcelas: Number(event.target.value) }))
            }
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
              <option key={parcela} value={parcela}>
                {parcela}x
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Valor</span>
        <input
          min="0.01"
          required
          inputMode="decimal"
          type="text"
          value={movementForm.valor}
          onChange={(event) => setMovementForm((prev) => ({ ...prev, valor: event.target.value }))}
        />
      </label>
      <label>
        <span>Descrição</span>
        <input
          value={movementForm.descricao}
          onChange={(event) => setMovementForm((prev) => ({ ...prev, descricao: event.target.value }))}
          placeholder="Ex.: Pagamento de cliente"
        />
      </label>
      <button disabled={Boolean(saving)} type="submit">
        {saving === movementForm.tipo ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
        Registrar movimentação
      </button>
    </form>
  );
}
