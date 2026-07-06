import { BranchExportActions } from "./BranchExportActions";
import { BranchForm } from "./BranchForm";
import { BranchesList } from "./BranchesList";

export function BranchesSection({
  branchForm,
  branchRows,
  empresa,
  filiais,
  handleBranchSubmit,
  savingBranch,
  session,
  updateBranchForm,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Lojas e filiais</h2>
            <p>Cadastre unidades operacionais da empresa.</p>
          </div>
          <BranchExportActions branchRows={branchRows} empresa={empresa} session={session} />
        </div>

        <BranchForm
          branchForm={branchForm}
          handleBranchSubmit={handleBranchSubmit}
          savingBranch={savingBranch}
          updateBranchForm={updateBranchForm}
        />

        <BranchesList filiais={filiais} />
      </article>
    </section>
  );
}
