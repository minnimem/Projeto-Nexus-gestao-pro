import { Loader2, Truck } from "lucide-react";

export function LogisticsVehicleForm({ form, onFormChange, onSubmit, savingForm }) {
  return (
    <article className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Novo veículo</h2>
          <p>Cadastre frota ativa para rotas.</p>
        </div>
      </div>

      <form className="compact-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Placa</span>
          <input
            value={form.placa}
            onChange={(event) => onFormChange((prev) => ({ ...prev, placa: event.target.value }))}
            placeholder="ABC1D23"
          />
        </label>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Modelo</span>
            <input
              value={form.modelo}
              onChange={(event) => onFormChange((prev) => ({ ...prev, modelo: event.target.value }))}
              placeholder="Fiorino"
            />
          </label>
          <label className="form-control">
            <span>Marca</span>
            <input
              value={form.marca}
              onChange={(event) => onFormChange((prev) => ({ ...prev, marca: event.target.value }))}
              placeholder="Fiat"
            />
          </label>
        </div>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Tipo</span>
            <input
              value={form.tipo}
              onChange={(event) => onFormChange((prev) => ({ ...prev, tipo: event.target.value }))}
            />
          </label>
          <label className="form-control">
            <span>Capacidade kg</span>
            <input
              min="0"
              type="number"
              value={form.capacidadeKg}
              onChange={(event) => onFormChange((prev) => ({ ...prev, capacidadeKg: event.target.value }))}
            />
          </label>
        </div>
        <button className="checkout-button" disabled={savingForm === "veiculo"} type="submit">
          {savingForm === "veiculo" ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
          Salvar veículo
        </button>
      </form>
    </article>
  );
}
