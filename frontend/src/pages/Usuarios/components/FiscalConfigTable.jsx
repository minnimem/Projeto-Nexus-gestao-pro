import { ReceiptText } from "lucide-react";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { FiscalConfigRow } from "./FiscalConfigRow";

export function FiscalConfigTable({
  checkFiscalService,
  checkingFiscalServiceConfigId,
  configuracoesFiscais,
  editFiscalConfig,
  fiscalConfigStatusById,
  fiscalServiceStatusById,
  validateFiscalConfig,
  validatingFiscalConfigId,
}) {
  return (
    <div className="table-wrap customer-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Unidade</th>
            <th>Modelo</th>
            <th>Ambiente</th>
            <th>Série</th>
            <th>Segredos</th>
            <th>Status</th>
            <th>Status fiscal</th>
            <th>Serviço</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {configuracoesFiscais.length === 0 ? (
            <TableEmptyState
              colSpan="9"
              icon={ReceiptText}
              title="Nenhuma configuração fiscal"
              detail="Cadastre empresa, modelo fiscal, série e variáveis seguras para homologar."
            />
          ) : (
            configuracoesFiscais.map((config) => (
              <FiscalConfigRow
                checkFiscalService={checkFiscalService}
                checkingFiscalServiceConfigId={checkingFiscalServiceConfigId}
                config={config}
                editFiscalConfig={editFiscalConfig}
                key={config.id}
                serviceStatus={fiscalServiceStatusById[config.id]}
                status={fiscalConfigStatusById[config.id]}
                validateFiscalConfig={validateFiscalConfig}
                validatingFiscalConfigId={validatingFiscalConfigId}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
