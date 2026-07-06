export function BranchesList({ filiais }) {
  return (
    <div className="account-plan-grid compact-catalog-grid">
      {filiais.length === 0 ? (
        <div className="empty-selection compact">Nenhuma filial cadastrada.</div>
      ) : (
        filiais.slice(0, 8).map((filial) => (
          <div className="account-plan-item" key={filial.id}>
            <span>
              {filial.matriz ? "Matriz" : "Filial"} / {filial.codigo || "-"}
            </span>
            <strong>{filial.nome}</strong>
            <small>
              {[filial.cidade, filial.uf].filter(Boolean).join("/") ||
                filial.endereco ||
                "Sem endereço"}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
