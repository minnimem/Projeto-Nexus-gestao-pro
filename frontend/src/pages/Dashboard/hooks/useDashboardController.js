import { exportDashboardSnapshot } from "../services/dashboardExportService";
import { useDashboardData } from "./useDashboardData";
import { useDashboardShell } from "./useDashboardShell";
import { useGlobalAlerts } from "./useGlobalAlerts";

export function useDashboardController({ onLogout, session }) {
  const shell = useDashboardShell({ session });
  const dashboardData = useDashboardData({ active: shell.active, session });
  const alerts = useGlobalAlerts({
    active: shell.active,
    data: dashboardData.data,
    error: dashboardData.error,
    financeCriticalCount: dashboardData.financeCriticalCount,
    status: dashboardData.status,
  });

  function activateModule(moduleValue) {
    shell.activateModule(moduleValue);
    alerts.setShowTopbarAlerts(false);
  }

  function exportActiveModule() {
    exportDashboardSnapshot({
      active: shell.active,
      activeModule: shell.activeModule,
      activePeriodRange: shell.activePeriodRange,
      data: dashboardData.data,
      lastUpdatedAt: dashboardData.lastUpdatedAt,
      periodPreset: shell.periodPreset,
      session,
      status: dashboardData.status,
    });
  }

  const headerProps = {
    activeModule: shell.activeModule,
    activePeriodLabel: shell.activePeriodLabel,
    activateModule,
    commandMatches: shell.commandMatches,
    dismissVisibleTopbarAlerts: alerts.dismissVisibleTopbarAlerts,
    dismissedTopbarAlerts: alerts.dismissedTopbarAlerts,
    exportActiveModule,
    filteredTopbarAlerts: alerts.filteredTopbarAlerts,
    getAlertDismissKey: alerts.getAlertDismissKey,
    globalSearch: shell.globalSearch,
    globalSearchRef: shell.globalSearchRef,
    handleCommandKeyDown: shell.handleCommandKeyDown,
    lastUpdatedAt: dashboardData.lastUpdatedAt,
    onLogout,
    periodMenuRef: shell.periodMenuRef,
    periodPreset: shell.periodPreset,
    refreshActiveModule: dashboardData.refreshActiveModule,
    searchInputRef: shell.searchInputRef,
    session,
    setDismissedTopbarAlerts: alerts.setDismissedTopbarAlerts,
    setGlobalSearch: shell.setGlobalSearch,
    setPeriodPreset: shell.setPeriodPreset,
    setShowPeriodMenu: shell.setShowPeriodMenu,
    setShowTopbarAlerts: alerts.setShowTopbarAlerts,
    setShowUserMenu: shell.setShowUserMenu,
    setThemeMode: shell.setThemeMode,
    setTopbarAlertFilter: alerts.setTopbarAlertFilter,
    showPeriodMenu: shell.showPeriodMenu,
    showTopbarAlerts: alerts.showTopbarAlerts,
    showUserMenu: shell.showUserMenu,
    status: dashboardData.status,
    themeMode: shell.themeMode,
    topbarActiveAlertCount: alerts.topbarActiveAlertCount,
    topbarAlertBadgeTone: alerts.topbarAlertBadgeTone,
    topbarAlertFilter: alerts.topbarAlertFilter,
    topbarAlertPriorityText: alerts.topbarAlertPriorityText,
    topbarAlertRef: alerts.topbarAlertRef,
    topbarAlerts: alerts.topbarAlerts,
    topbarAlertSummary: alerts.topbarAlertSummary,
    topbarDismissableAlerts: alerts.topbarDismissableAlerts,
    topbarDismissedAlertCount: alerts.topbarDismissedAlertCount,
    userMenuRef: shell.userMenuRef,
    visibleModules: shell.visibleModules,
  };

  return {
    headerProps,
    layoutProps: {
      collapsed: shell.sidebarCollapsed,
      theme: shell.themeMode,
    },
    sidebarProps: {
      active: shell.active,
      collapsed: shell.sidebarCollapsed,
      financeCriticalCount: dashboardData.financeCriticalCount,
      modules: shell.visibleModules,
      onActivate: activateModule,
      onToggle: shell.toggleSidebar,
    },
    workspaceProps: {
      active: shell.active,
      activeModule: shell.activeModule,
      data: dashboardData.data,
      error: dashboardData.error,
      onActivate: activateModule,
      onRefresh: dashboardData.refreshActiveModule,
      periodPreset: shell.periodPreset,
      periodRange: shell.activePeriodRange,
      quickActions: shell.quickActions,
      session,
      status: dashboardData.status,
      visibleModules: shell.visibleModules,
    },
  };
}
