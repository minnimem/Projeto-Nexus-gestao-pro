import { AdminAuditFilters } from "./AdminAuditFilters";
import { AdminAuditHeader } from "./AdminAuditHeader";
import { AdminAuditTable } from "./AdminAuditTable";

export function AdminAuditSection({
  auditActions,
  auditFilter,
  auditModules,
  auditRows,
  auditTotalPages,
  currentAuditPage,
  filteredAudit,
  getAuditUserBranch,
  pagedAudit,
  session,
  setAuditFilter,
  setAuditPage,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <AdminAuditHeader auditRows={auditRows} session={session} />

        <AdminAuditFilters
          auditActions={auditActions}
          auditFilter={auditFilter}
          auditModules={auditModules}
          setAuditFilter={setAuditFilter}
        />

        <AdminAuditTable
          auditTotalPages={auditTotalPages}
          currentAuditPage={currentAuditPage}
          filteredAudit={filteredAudit}
          getAuditUserBranch={getAuditUserBranch}
          pagedAudit={pagedAudit}
          setAuditPage={setAuditPage}
        />
      </article>
    </section>
  );
}
