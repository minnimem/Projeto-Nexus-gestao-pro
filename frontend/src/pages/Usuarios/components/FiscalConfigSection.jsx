import { Download, Printer } from "lucide-react";
import { getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { FiscalConfigForm } from "./FiscalConfigForm";
import { FiscalConfigTable } from "./FiscalConfigTable";

export function FiscalConfigSection({
  checkFiscalService,
  checkingFiscalServiceConfigId,
  configuracoesFiscais,
  editFiscalConfig,
  editingFiscalConfig,
  empresa,
  filiais,
  fiscalConfigForm,
  fiscalConfigRows,
  fiscalConfigStatusById,
  fiscalServiceStatusById,
  handleFiscalConfigSubmit,
  resetFiscalConfigForm,
  savingFiscalConfig,
  session,
  updateFiscalConfigForm,
  validateFiscalConfig,
  validatingFiscalConfigId,
}) {
  return (
    <section className="content-grid single">
      <article className="panel orders-panel">
        <div className="panel-title">
          <div>
            <h2>Configuração fiscal</h2>
            <p>Base de homologação por empresa, filial e modelo fiscal.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={fiscalConfigRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-configuracoes-fiscais-${getLocalDateKey()}.csv`, fiscalConfigRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={fiscalConfigRows.length === 0}
              onClick={() => printRowsDocument("Configurações fiscais", fiscalConfigRows, empresa.nome || session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <FiscalConfigForm
          editingFiscalConfig={editingFiscalConfig}
          filiais={filiais}
          fiscalConfigForm={fiscalConfigForm}
          handleFiscalConfigSubmit={handleFiscalConfigSubmit}
          resetFiscalConfigForm={resetFiscalConfigForm}
          savingFiscalConfig={savingFiscalConfig}
          updateFiscalConfigForm={updateFiscalConfigForm}
        />

        <FiscalConfigTable
          checkFiscalService={checkFiscalService}
          checkingFiscalServiceConfigId={checkingFiscalServiceConfigId}
          configuracoesFiscais={configuracoesFiscais}
          editFiscalConfig={editFiscalConfig}
          fiscalConfigStatusById={fiscalConfigStatusById}
          fiscalServiceStatusById={fiscalServiceStatusById}
          validateFiscalConfig={validateFiscalConfig}
          validatingFiscalConfigId={validatingFiscalConfigId}
        />
      </article>
    </section>
  );
}
