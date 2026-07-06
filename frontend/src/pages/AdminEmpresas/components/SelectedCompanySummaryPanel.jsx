import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { formatDate, formatNumber } from "../../../utils/formatters";

export function SelectedCompanySummaryPanel({
  handleCompanyStatusChange,
  planDraft,
  savingCompanyStatus,
  selectedCompany,
  setStatusObservation,
  statusObservation,
}) {
  return (
    <article className="panel">
      <div className="panel-title">
        <div>
          <h2>{selectedCompany.nome || "Empresa selecionada"}</h2>
          <p>{selectedCompany.razaoSocial || selectedCompany.email || "Gestão comercial master"}</p>
        </div>
        <div className="account-plan-actions">
          <span>{selectedCompany.planoComercial || "STARTER"}</span>
          <button
            className={selectedCompany.ativo === false ? "ghost-button" : "danger-button"}
            disabled={savingCompanyStatus || !selectedCompany.id}
            onClick={handleCompanyStatusChange}
            type="button"
          >
            {savingCompanyStatus ? <Loader2 className="spin" size={15} /> : selectedCompany.ativo === false ? <CheckCircle2 size={15} /> : <LockKeyhole size={15} />}
            {selectedCompany.ativo === false ? "Ativar" : "Inativar"}
          </button>
        </div>
      </div>
      <label className="form-control compact">
        <span>Motivo para ativar/inativar</span>
        <input
          disabled={savingCompanyStatus}
          value={statusObservation}
          onChange={(event) => setStatusObservation(event.target.value)}
          placeholder="Ex.: inadimplência, retorno do cliente, fim do piloto"
        />
      </label>

      <div className="account-plan-grid compact-catalog-grid">
        <div className="account-plan-item">
          <span>Assinatura</span>
          <strong>{selectedCompany.statusAssinatura || "TESTE"}</strong>
          <small>{selectedCompany.ativo === false ? "Empresa inativa" : "Empresa ativa"}</small>
        </div>
        <div className="account-plan-item">
          <span>Usuários</span>
          <strong>{formatNumber(selectedCompany.usuariosAtivos || 0)}</strong>
          <small>Limite {formatNumber(planDraft.limiteUsuarios || 0)}</small>
        </div>
        <div className="account-plan-item">
          <span>Filiais</span>
          <strong>{formatNumber(selectedCompany.filiais || 0)}</strong>
          <small>Limite {formatNumber(planDraft.limiteFiliais || 0)}</small>
        </div>
        <div className="account-plan-item">
          <span>Criada em</span>
          <strong>{selectedCompany.dataCadastro ? formatDate(selectedCompany.dataCadastro) : "-"}</strong>
          <small>{[selectedCompany.cidade, selectedCompany.uf].filter(Boolean).join("/") || "Sem cidade"}</small>
        </div>
      </div>
    </article>
  );
}
