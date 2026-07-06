import { Maximize2, Minimize2, ShoppingCart, WalletCards } from "lucide-react";

export function CashViewSwitch({
  caixa,
  cashExpanded,
  cashView,
  onToggleExpanded,
  setCashView,
}) {
  return (
    <>
      <div className="cash-compact-actions">
        <button
          className="cash-fullscreen-button compact"
          onClick={onToggleExpanded}
          title={cashExpanded ? "Diminuir caixa (F11)" : "Expandir caixa (F11)"}
          type="button"
        >
          {cashExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          {cashExpanded ? "Diminuir" : "Expandir"}
          <kbd>F11</kbd>
        </button>
      </div>

      <div className="view-switch cash-view-switch" role="tablist" aria-label="Caixa">
        <button
          className={cashView === "pdv" ? "active" : ""}
          disabled={!caixa}
          onClick={() => setCashView("pdv")}
          type="button"
        >
          <ShoppingCart size={17} />
          PDV Caixa
        </button>
        <button
          className={cashView === "movimentos" ? "active" : ""}
          onClick={() => setCashView("movimentos")}
          type="button"
        >
          <WalletCards size={17} />
          Movimentação
        </button>
      </div>
    </>
  );
}
