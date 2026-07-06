import { DashboardModuleNavigation } from "./DashboardModuleNavigation";
import { DashboardModulePanel } from "./DashboardModulePanel";
import { DashboardWorkspaceHero } from "./DashboardWorkspaceHero";

export function DashboardWorkspace({
  active,
  activeModule,
  data,
  error,
  onActivate,
  onRefresh,
  periodPreset,
  periodRange,
  quickActions,
  session,
  status,
  visibleModules,
}) {
  return (
    <>
      <DashboardWorkspaceHero />
      <DashboardModuleNavigation
        active={active}
        onActivate={onActivate}
        quickActions={quickActions}
        visibleModules={visibleModules}
      />
      <DashboardModulePanel
        active={active}
        activeModule={activeModule}
        data={data}
        error={error}
        onRefresh={onRefresh}
        periodPreset={periodPreset}
        periodRange={periodRange}
        session={session}
        status={status}
      />
    </>
  );
}
