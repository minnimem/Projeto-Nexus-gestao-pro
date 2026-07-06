import "./DashboardLayout.css";

export function DashboardLayout({ children, collapsed, sidebar, theme }) {
  return (
    <main className={`app-shell theme-${theme} ${collapsed ? "sidebar-collapsed" : ""}`}>
      {sidebar}
      <section className="workspace">{children}</section>
    </main>
  );
}
