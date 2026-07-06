import { CompanyOperationsContent } from "./CompanyOperationsContent";
import { GovernanceAuditContent } from "./GovernanceAuditContent";
import { UserControlPanelContainer } from "./UserControlPanelContainer";
import { UserDashboardOverview } from "./UserDashboardOverview";
import { UserFormModalHost } from "./UserFormModalHost";

export function UsuariosDashboardContent({
  companyAdmin,
  controlPanelTab,
  dashboard,
  fiscalOps,
  isPrivilegedPerfil,
  message,
  planBilling,
  session,
  setControlPanelTab,
  userOps,
}) {
  return (
    <div className="dashboard-view">
      <UserDashboardOverview dashboard={dashboard} />

      <UserControlPanelContainer
        companyAdmin={companyAdmin}
        controlPanelTab={controlPanelTab}
        dashboard={dashboard}
        planBilling={planBilling}
        setControlPanelTab={setControlPanelTab}
      />

      <CompanyOperationsContent
        companyAdmin={companyAdmin}
        dashboard={dashboard}
        fiscalOps={fiscalOps}
        session={session}
      />

      <GovernanceAuditContent
        dashboard={dashboard}
        isPrivilegedPerfil={isPrivilegedPerfil}
        session={session}
        userOps={userOps}
      />

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <UserFormModalHost dashboard={dashboard} message={message} userOps={userOps} />
    </div>
  );
}
