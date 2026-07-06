import { formatNumber } from "../../../utils/formatters";

export function ControlPanelHeader({ liberationRows }) {
  return (
    <div className="panel-title">
      <div>
        <h2>Painel de controle</h2>
        <p>Acesso master para plano, homologação e liberação de produção por módulo.</p>
      </div>
      <span>{formatNumber(liberationRows.filter((row) => row.liberado).length)} liberado(s)</span>
    </div>
  );
}
