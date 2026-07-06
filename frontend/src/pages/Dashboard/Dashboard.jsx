import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Header } from "../../layouts/Header";
import { Sidebar } from "../../layouts/Sidebar";
import { DashboardWorkspace } from "./components/DashboardWorkspace";
import { useDashboardController } from "./hooks/useDashboardController";
import "./Dashboard.css";

export function Dashboard({ session, onLogout }) {
  const {
    headerProps,
    layoutProps,
    sidebarProps,
    workspaceProps,
  } = useDashboardController({ onLogout, session });

  return (
    <DashboardLayout
      collapsed={layoutProps.collapsed}
      sidebar={<Sidebar {...sidebarProps} />}
      theme={layoutProps.theme}
    >
      <Header {...headerProps} />
      <DashboardWorkspace {...workspaceProps} />
    </DashboardLayout>
  );
}
