import { Loader2, ReceiptText, X } from "lucide-react";
import {
  FiscalCertificateFields,
  FiscalIdentityFields,
  FiscalIntegrationFields,
  FiscalProviderFields,
} from "./FiscalConfigFields";

export function FiscalConfigForm({
  editingFiscalConfig,
  filiais,
  fiscalConfigForm,
  handleFiscalConfigSubmit,
  resetFiscalConfigForm,
  savingFiscalConfig,
  updateFiscalConfigForm,
}) {
  return (
    <form className="compact-form company-form" onSubmit={handleFiscalConfigSubmit}>
      <FiscalIdentityFields
        filiais={filiais}
        fiscalConfigForm={fiscalConfigForm}
        updateFiscalConfigForm={updateFiscalConfigForm}
      />

      <FiscalProviderFields
        fiscalConfigForm={fiscalConfigForm}
        updateFiscalConfigForm={updateFiscalConfigForm}
      />

      <FiscalCertificateFields
        fiscalConfigForm={fiscalConfigForm}
        updateFiscalConfigForm={updateFiscalConfigForm}
      />

      <FiscalIntegrationFields
        fiscalConfigForm={fiscalConfigForm}
        updateFiscalConfigForm={updateFiscalConfigForm}
      />

      <label className="form-control">
        <span>Observação</span>
        <textarea
          value={fiscalConfigForm.observacao}
          onChange={(event) => updateFiscalConfigForm("observacao", event.target.value)}
          placeholder="Credenciamento, serie autorizada, restrições de homologação"
        />
      </label>

      <label className="bulk-select-toggle">
        <input
          checked={fiscalConfigForm.ativo}
          type="checkbox"
          onChange={(event) => updateFiscalConfigForm("ativo", event.target.checked)}
        />
        Configuração ativa
      </label>

      <div className="form-actions-inline">
        <button className="checkout-button" disabled={savingFiscalConfig} type="submit">
          {savingFiscalConfig ? <Loader2 className="spin" size={17} /> : <ReceiptText size={17} />}
          {savingFiscalConfig ? "Salvando..." : editingFiscalConfig ? "Atualizar configuração" : "Salvar configuração"}
        </button>
        {editingFiscalConfig && (
          <button className="report-export secondary" onClick={resetFiscalConfigForm} type="button">
            <X size={15} />
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}
