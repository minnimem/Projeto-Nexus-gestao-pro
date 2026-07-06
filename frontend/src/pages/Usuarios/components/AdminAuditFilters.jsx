import { X } from "lucide-react";

export function AdminAuditFilters({
  auditActions,
  auditFilter,
  auditModules,
  setAuditFilter,
}) {
  const hasActiveFilter =
    auditFilter.busca ||
    auditFilter.modulo !== "TODOS" ||
    auditFilter.acao !== "TODOS" ||
    auditFilter.inicio ||
    auditFilter.fim;

  return (
    <div className="audit-filters">
      <label>
        <span>Busca</span>
        <input
          value={auditFilter.busca}
          onChange={(event) => setAuditFilter((current) => ({ ...current, busca: event.target.value }))}
          placeholder="Usuário, filial, descrição ou registro"
        />
      </label>
      <label>
        <span>Módulo</span>
        <select
          value={auditFilter.modulo}
          onChange={(event) => setAuditFilter((current) => ({ ...current, modulo: event.target.value }))}
        >
          {auditModules.map((modulo) => (
            <option key={modulo} value={modulo}>
              {modulo === "TODOS" ? "Todos" : modulo}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Ação</span>
        <select
          value={auditFilter.acao}
          onChange={(event) => setAuditFilter((current) => ({ ...current, acao: event.target.value }))}
        >
          {auditActions.map((acao) => (
            <option key={acao} value={acao}>
              {acao === "TODOS" ? "Todas" : acao}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Início</span>
        <input
          type="date"
          value={auditFilter.inicio}
          onChange={(event) => setAuditFilter((current) => ({ ...current, inicio: event.target.value }))}
        />
      </label>
      <label>
        <span>Fim</span>
        <input
          type="date"
          value={auditFilter.fim}
          onChange={(event) => setAuditFilter((current) => ({ ...current, fim: event.target.value }))}
        />
      </label>
      <button
        disabled={!hasActiveFilter}
        onClick={() => setAuditFilter({ busca: "", modulo: "TODOS", acao: "TODOS", inicio: "", fim: "" })}
        type="button"
      >
        <X size={16} />
        Limpar
      </button>
    </div>
  );
}
