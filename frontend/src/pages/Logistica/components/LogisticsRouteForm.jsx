import { Loader2, MapPinned, Printer } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import {
  getDeliveryAddress,
  getDeliveryCustomer,
  getDeliveryOrderNumber,
  printDeliveryReceipt,
} from "../viewModels/logisticsViewModel";

export function LogisticsRouteForm({
  canPrintRoute,
  companyName,
  editingRoute,
  entregadores,
  entregasDisponiveis,
  form,
  onCancelEdit,
  onFormChange,
  onSubmit,
  savingForm,
  veiculos,
}) {
  return (
    <article className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Nova rota</h2>
          <p>{editingRoute ? "Atualize planejamento, cobrança e recursos." : "Planejamento operacional."}</p>
        </div>
        {editingRoute && (
          <button className="panel-action-button light" onClick={onCancelEdit} type="button">
            Cancelar edição
          </button>
        )}
      </div>

      <form className="compact-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Nome da rota</span>
          <input
            value={form.nome}
            onChange={(event) => onFormChange((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Rota Centro"
          />
        </label>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Data</span>
            <input
              type="date"
              value={form.dataRota}
              onChange={(event) => onFormChange((prev) => ({ ...prev, dataRota: event.target.value }))}
            />
          </label>
          <label className="form-control">
            <span>Entregas</span>
            <input readOnly value={form.entregaIds.length} />
          </label>
        </div>
        <div className="delivery-picker">
          <div className="delivery-picker-title">
            <strong>Pedidos para esta rota</strong>
            <span>{formatNumber(form.entregaIds.length)} selecionado(s)</span>
          </div>
          {entregasDisponiveis.length === 0 ? (
            <div className="empty-selection compact">Nenhuma entrega disponível. Receba pedidos de entrega no caixa primeiro.</div>
          ) : (
            entregasDisponiveis.map((entrega) => {
              const checked = form.entregaIds.includes(entrega.id);
              return (
                <label className="delivery-option" key={entrega.id}>
                  <input
                    checked={checked}
                    type="checkbox"
                    onChange={(event) =>
                      onFormChange((prev) => ({
                        ...prev,
                        entregaIds: event.target.checked
                          ?
                          [...prev.entregaIds, entrega.id]
                          : prev.entregaIds.filter((id) => id !== entrega.id),
                      }))
                    }
                  />
                  <span>
                    <strong>{getDeliveryCustomer(entrega)}</strong>
                    <small>{getDeliveryOrderNumber(entrega)} / {entrega.filial || "Empresa"} / {getDeliveryAddress(entrega)}</small>
                  </span>
                  <em>
                    {entrega.rotaNome || "Sem rota"}
                    {canPrintRoute && (
                      <button
                        className="inline-icon-button"
                        onClick={(event) => {
                          event.preventDefault();
                          printDeliveryReceipt(entrega, null, companyName);
                        }}
                        title="Imprimir comprovante"
                        type="button"
                      >
                        <Printer size={12} />
                      </button>
                    )}
                  </em>
                </label>
              );
            })
          )}
        </div>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Motorista</span>
            <select
              value={form.entregadorId}
              onChange={(event) => onFormChange((prev) => ({ ...prev, entregadorId: event.target.value }))}
            >
              <option value="">Sem motorista</option>
              {entregadores.map((entregador) => (
                <option key={entregador.id} value={entregador.id}>
                  {entregador.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span>Veículo</span>
            <select
              value={form.veiculoId}
              onChange={(event) => onFormChange((prev) => ({ ...prev, veiculoId: event.target.value }))}
            >
              <option value="">Sem veículo</option>
              {veiculos.map((veiculo) => (
                <option key={veiculo.id} value={veiculo.id}>
                  {[veiculo.placa, veiculo.modelo].filter(Boolean).join(" / ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Distância km</span>
            <input
              min="0"
              step="0.1"
              type="number"
              value={form.distanciaKm}
              onChange={(event) => onFormChange((prev) => ({ ...prev, distanciaKm: event.target.value }))}
            />
          </label>
          <label className="form-control">
            <span>Custo estimado</span>
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.custoEstimado}
              onChange={(event) => onFormChange((prev) => ({ ...prev, custoEstimado: event.target.value }))}
            />
          </label>
        </div>
        <label className="form-control">
          <span>Pagamento</span>
          <select
            value={form.pagamentoEntrega}
            onChange={(event) => onFormChange((prev) => ({ ...prev, pagamentoEntrega: event.target.value }))}
          >
            <option value="JA_PAGO">Já está pago</option>
            <option value="PAGAR_NA_ENTREGA">Receber na entrega</option>
            <option value="RECEBER_RETORNO">Receber no retorno</option>
          </select>
        </label>
        <label className="form-control">
          <span>Observação</span>
          <textarea
            value={form.observacao}
            onChange={(event) => onFormChange((prev) => ({ ...prev, observacao: event.target.value }))}
          />
        </label>
        <button className="checkout-button" disabled={savingForm === "rota"} type="submit">
          {savingForm === "rota" ? <Loader2 className="spin" size={17} /> : <MapPinned size={17} />}
          {editingRoute ? "Atualizar rota" : "Salvar rota"}
        </button>
      </form>
    </article>
  );
}
