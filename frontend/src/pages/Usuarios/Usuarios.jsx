import { useState } from "react";
import { isPrivilegedPerfil } from "../../utils/permissions";
import {
  RestrictedAdminState,
  UsuariosDashboardContent,
} from "./components";
import {
  useCompanyAdminOperations,
  useFiscalConfigOperations,
  usePlanBillingOperations,
  useUsuariosDashboardData,
  useUserManagementOperations,
} from "./hooks";
import "./Usuarios.css";

export function Usuarios({ data, session, onRefresh }) {
  const [message, setMessage] = useState(null);
  const [controlPanelTab, setControlPanelTab] = useState("liberacoes");

  const dashboard = useUsuariosDashboardData({ data, session });
  const fiscalOps = useFiscalConfigOperations({
    empresaId: dashboard.empresaId,
    onRefresh,
    setMessage,
  });
  const userOps = useUserManagementOperations({
    onRefresh,
    setMessage,
  });
  const companyAdmin = useCompanyAdminOperations({
    empresa: dashboard.empresa,
    liberacoes: dashboard.liberacoes,
    liberationRows: dashboard.liberationRows,
    onRefresh,
    setMessage,
  });
  const planBilling = usePlanBillingOperations({
    masterEmpresas: dashboard.masterEmpresas,
    onRefresh,
    setMessage,
  });

  if (data.restricted || !isPrivilegedPerfil(session.perfil)) {
    return <RestrictedAdminState />;
  }

  return (
    <UsuariosDashboardContent
      companyAdmin={companyAdmin}
      controlPanelTab={controlPanelTab}
      dashboard={dashboard}
      fiscalOps={fiscalOps}
      isPrivilegedPerfil={isPrivilegedPerfil}
      message={message}
      planBilling={planBilling}
      session={session}
      setControlPanelTab={setControlPanelTab}
      userOps={userOps}
    />
  );
}
