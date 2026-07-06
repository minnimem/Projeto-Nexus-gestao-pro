import { formatCurrency, formatDate } from "../../../utils/formatters";

export function ContractsList({ contratos }) {
  return (
    <div className="account-plan-grid compact-catalog-grid">
      {contratos.length === 0 ? (
        <div className="empty-selection compact">Nenhum contrato cadastrado.</div>
      ) : (
        contratos.slice(0, 8).map((contrato) => (
          <div className="account-plan-item" key={contrato.id}>
            <span>{contrato.status || "ATIVO"} / {contrato.tipo || "Contrato"}</span>
            <strong>{contrato.nome}</strong>
            <small>{contrato.filial || "Empresa"} / até {contrato.dataFim ? formatDate(contrato.dataFim) : "-"}</small>
            <small>{formatCurrency(contrato.valorMensal || 0)} mensais</small>
          </div>
        ))
      )}
    </div>
  );
}
