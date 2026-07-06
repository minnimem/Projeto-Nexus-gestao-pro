import { Maximize2, Minimize2 } from "lucide-react";

export function CashTerminalHeader({
  caixa,
  cashExpanded,
  onToggleExpanded,
  session,
}) {
  return (
    <section className="cash-terminal-head">
      <div className="cash-terminal-title">
        <strong>CAIXA LIVRE - VENDA</strong>
        <span>PDV: {caixa.id || "aguardando"} | Operador: {caixa.usuarioNome || caixa.usuarioLogin || session.usuario || session.login || "-"}</span>
      </div>
      <div className="cash-terminal-status">
        <span className={caixa ? "online" : "offline"}>{caixa.status || "SEM CAIXA"}</span>
      </div>
      <button
        className="cash-fullscreen-button"
        onClick={onToggleExpanded}
        title={cashExpanded ? "Diminuir caixa (F11)" : "Expandir caixa (F11)"}
        type="button"
      >
        {cashExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        {cashExpanded ? "Diminuir" : "Expandir"}
        <kbd>F11</kbd>
      </button>
    </section>
  );
}
