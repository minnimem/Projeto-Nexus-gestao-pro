import { Loader2, Mail } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import { getStockMinimum, getStockProductName, getStockQuantity } from "../../../utils/stock";
import "./ProductStockAlertsSection.css";

export function ProductStockAlertsSection({
  canManageNotifications,
  estoqueBaixo,
  onSendNotifications,
  saving,
}) {
  return (
    <section className="inventory-tool-card inventory-alert-card">
      <div className="ranking stock-alerts">
        <div className="panel-title compact">
          <div>
            <h3>Alertas de estoque</h3>
            <p>{formatNumber(estoqueBaixo.length)} item(ns) abaixo do limite operacional.</p>
          </div>
          {canManageNotifications && (
            <button
              className="mini-action-button"
              disabled={saving || estoqueBaixo.length === 0}
              onClick={onSendNotifications}
              type="button"
            >
              {saving ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
              Notificar
            </button>
          )}
        </div>
        {estoqueBaixo.length === 0 ? (
          <p>Nenhum produto em estoque baixo agora.</p>
        ) : (
          estoqueBaixo.map((item) => (
            <div className="ranking-row" key={item.id || getStockProductName(item)}>
              <span>
                {getStockProductName(item)}
                <small>Mínimo {formatNumber(getStockMinimum(item))}</small>
              </span>
              <strong>{formatNumber(getStockQuantity(item))} un.</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
