import { formatNumber, getDataCount } from "../../utils/formatters";
import "./ModulePreview.css";

export function ModulePreview({ module, data }) {
  const Icon = module.icon;

  return (
    <div className="module-preview">
      <div className="preview-icon">
        <Icon size={24} />
      </div>
      <h2>{module.label}</h2>
      <p>
        Endpoint conectado com sucesso. Este módulo já está pronto para receber
        a tela premium completa.
      </p>
      <div className="preview-stat">
        <span>Dados recebidos</span>
        <strong>{formatNumber(getDataCount(data))}</strong>
      </div>
    </div>
  );
}
