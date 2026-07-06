import { Loader2, MapPin } from "lucide-react";

export function BranchForm({
  branchForm,
  handleBranchSubmit,
  savingBranch,
  updateBranchForm,
}) {
  return (
    <form className="compact-form company-form" onSubmit={handleBranchSubmit}>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Nome</span>
          <input
            value={branchForm.nome}
            onChange={(event) => updateBranchForm("nome", event.target.value)}
            placeholder="Filial Centro"
          />
        </label>
        <label className="form-control">
          <span>Código</span>
          <input
            value={branchForm.codigo}
            onChange={(event) => updateBranchForm("codigo", event.target.value)}
            placeholder="FIL-001"
          />
        </label>
      </div>
      <div className="finance-form-row">
        <label className="form-control">
          <span>CNPJ</span>
          <input
            value={branchForm.cnpj}
            onChange={(event) => updateBranchForm("cnpj", event.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </label>
        <label className="form-control">
          <span>Telefone</span>
          <input
            value={branchForm.telefone}
            onChange={(event) => updateBranchForm("telefone", event.target.value)}
          />
        </label>
      </div>
      <label className="form-control">
        <span>Endereco</span>
        <input
          value={branchForm.endereco}
          onChange={(event) => updateBranchForm("endereco", event.target.value)}
          placeholder="Rua, número, bairro"
        />
      </label>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Cidade</span>
          <input
            value={branchForm.cidade}
            onChange={(event) => updateBranchForm("cidade", event.target.value)}
          />
        </label>
        <label className="form-control">
          <span>UF</span>
          <input
            maxLength="2"
            value={branchForm.uf}
            onChange={(event) => updateBranchForm("uf", event.target.value.toUpperCase())}
          />
        </label>
      </div>
      <label className="bulk-select-toggle">
        <input
          checked={branchForm.matriz}
          type="checkbox"
          onChange={(event) => updateBranchForm("matriz", event.target.checked)}
        />
        Unidade matriz
      </label>
      <button className="checkout-button" disabled={savingBranch} type="submit">
        {savingBranch ? <Loader2 className="spin" size={17} /> : <MapPin size={17} />}
        {savingBranch ? "Salvando..." : "Salvar filial"}
      </button>
    </form>
  );
}
