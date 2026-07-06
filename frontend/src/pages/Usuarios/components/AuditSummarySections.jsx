import { AuditEntitySummarySection } from "./AuditEntitySummarySection";
import { AuditModuleSummarySection } from "./AuditModuleSummarySection";

export function AuditSummarySections({
  auditEntityRows,
  auditEntitySummary,
  auditModuleRows,
  auditModuleSummary,
  filteredAudit,
  session,
}) {
  return (
    <>
      <AuditModuleSummarySection
        auditModuleRows={auditModuleRows}
        auditModuleSummary={auditModuleSummary}
        filteredAudit={filteredAudit}
        session={session}
      />
      <AuditEntitySummarySection
        auditEntityRows={auditEntityRows}
        auditEntitySummary={auditEntitySummary}
        session={session}
      />
    </>
  );
}
