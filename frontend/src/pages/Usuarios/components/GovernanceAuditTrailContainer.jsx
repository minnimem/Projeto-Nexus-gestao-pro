import { AdminAuditSection } from "./AdminAuditSection";
import { AuditSummarySections } from "./AuditSummarySections";

export function GovernanceAuditTrailContainer({ dashboard, session }) {
  return (
    <>
      <AuditSummarySections
        auditEntityRows={dashboard.auditEntityRows}
        auditEntitySummary={dashboard.auditEntitySummary}
        auditModuleRows={dashboard.auditModuleRows}
        auditModuleSummary={dashboard.auditModuleSummary}
        filteredAudit={dashboard.filteredAudit}
        session={session}
      />

      <AdminAuditSection
        auditActions={dashboard.auditActions}
        auditFilter={dashboard.auditFilter}
        auditModules={dashboard.auditModules}
        auditRows={dashboard.auditRows}
        auditTotalPages={dashboard.auditTotalPages}
        currentAuditPage={dashboard.currentAuditPage}
        filteredAudit={dashboard.filteredAudit}
        getAuditUserBranch={dashboard.getAuditUserBranch}
        pagedAudit={dashboard.pagedAudit}
        session={session}
        setAuditFilter={dashboard.setAuditFilter}
        setAuditPage={dashboard.setAuditPage}
      />
    </>
  );
}
