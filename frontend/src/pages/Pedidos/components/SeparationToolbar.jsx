import { Search, X } from "lucide-react";
import {
  SEPARATION_DELIVERY_OPTIONS,
  SEPARATION_STAGE_OPTIONS,
} from "../constants/separation";

export function SeparationToolbar({ queue }) {
  return (
    <div className="separation-toolbar">
      <label className="separation-search">
        <Search size={16} />
        <input
          aria-label="Buscar pedido na separação"
          onChange={(event) => queue.setSearch(event.target.value)}
          placeholder="Pedido, cliente ou produto"
          value={queue.search}
        />
      </label>
      <select
        aria-label="Filtrar etapa da separação"
        onChange={(event) => queue.setStageFilter(event.target.value)}
        value={queue.stageFilter}
      >
        {SEPARATION_STAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <select
        aria-label="Filtrar tipo de entrega"
        onChange={(event) => queue.setDeliveryFilter(event.target.value)}
        value={queue.deliveryFilter}
      >
        {SEPARATION_DELIVERY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {queue.hasFilters && (
        <button className="mini-action-button" onClick={queue.clearFilters} type="button">
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  );
}
