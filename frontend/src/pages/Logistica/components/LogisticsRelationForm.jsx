import { Loader2, Truck } from "lucide-react";
import { formatDate } from "../../../utils/formatters";

export function LogisticsRelationForm({
  branchScopedRoutes,
  entregadores,
  form,
  getRouteBranchLabel,
  onFormChange,
  onSubmit,
  savingForm,
  veiculos,
}) {
  return (
    <article className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Relacionar frota</h2>
          <p>Vincule motorista e veículo a uma rota existente.</p>
        </div>
      </div>

      <form className="compact-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Rota</span>
          <select
            value={form.rotaId}
            onChange={(event) => onFormChange((prev) => ({ ...prev, rotaId: event.target.value }))}
          >
            <option value="">Selecione</option>
            {branchScopedRoutes.map((rota) => (
              <option key={rota.id} value={rota.id}>
                {rota.nome} - {getRouteBranchLabel(rota)} - {formatDate(rota.dataRota)}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span>Motorista</span>
          <select
            value={form.entregadorId}
            onChange={(event) => onFormChange((prev) => ({ ...prev, entregadorId: event.target.value }))}
          >
            <option value="">Manter atual</option>
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
            <option value="">Manter atual</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {[veiculo.placa, veiculo.modelo].filter(Boolean).join(" / ")}
              </option>
            ))}
          </select>
        </label>
        <button className="checkout-button" disabled={savingForm === "relacao"} type="submit">
          {savingForm === "relacao" ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
          Relacionar
        </button>
      </form>
    </article>
  );
}
