import { sectionClass } from "../../../utils/sales";
import { FiscalControlHeader } from "./FiscalControlHeader";
import { FiscalControlStatusSummary } from "./FiscalControlStatusSummary";
import { FiscalHistoryPanel } from "./FiscalHistoryPanel";

export function SalesFiscalControlSection({
  canExportTechnicalJson,
  fiscal,
  selectedSalesBranchLabel,
  session,
  showFiscalControl,
}) {
  const {
    fiscalControlRows,
    fiscalHistory,
    fiscalHistoryRows,
    primaryFiscalStatusSummary,
    secondaryFiscalStatusSummary,
  } = fiscal;

  return (
    <section className={`panel account-plan-summary${sectionClass(showFiscalControl)}`}>
      <FiscalControlHeader
        canExportTechnicalJson={canExportTechnicalJson}
        fiscalControlRows={fiscalControlRows}
        session={session}
      />

      <FiscalControlStatusSummary
        primaryFiscalStatusSummary={primaryFiscalStatusSummary}
        secondaryFiscalStatusSummary={secondaryFiscalStatusSummary}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
      />

      <FiscalHistoryPanel
        canExportTechnicalJson={canExportTechnicalJson}
        fiscalHistory={fiscalHistory}
        fiscalHistoryRows={fiscalHistoryRows}
        session={session}
      />
    </section>
  );
}
