import { HeaderActions, HeaderLogoutAction } from "../components/HeaderActions/HeaderActions";
import { HeaderAlerts } from "../components/HeaderAlerts/HeaderAlerts";
import { HeaderModuleSummary } from "../components/HeaderModuleSummary/HeaderModuleSummary";
import { HeaderOperationSummary } from "../components/HeaderOperationSummary/HeaderOperationSummary";
import { HeaderPeriodSelector } from "../components/HeaderPeriodSelector/HeaderPeriodSelector";
import { HeaderSearch } from "../components/HeaderSearch/HeaderSearch";
import { HeaderUserMenu } from "../components/HeaderUserMenu/HeaderUserMenu";
import "./Header.css";

export function Header({
  activeModule,
  activePeriodLabel,
  activateModule,
  commandMatches,
  dismissVisibleTopbarAlerts,
  dismissedTopbarAlerts,
  exportActiveModule,
  filteredTopbarAlerts,
  getAlertDismissKey,
  globalSearch,
  globalSearchRef,
  handleCommandKeyDown,
  lastUpdatedAt,
  onLogout,
  periodMenuRef,
  periodPreset,
  refreshActiveModule,
  searchInputRef,
  session,
  setDismissedTopbarAlerts,
  setGlobalSearch,
  setPeriodPreset,
  setShowPeriodMenu,
  setShowTopbarAlerts,
  setShowUserMenu,
  setThemeMode,
  setTopbarAlertFilter,
  showPeriodMenu,
  showTopbarAlerts,
  showUserMenu,
  status,
  themeMode,
  topbarActiveAlertCount,
  topbarAlertBadgeTone,
  topbarAlertFilter,
  topbarAlertPriorityText,
  topbarAlertRef,
  topbarAlerts,
  topbarAlertSummary,
  topbarDismissableAlerts,
  topbarDismissedAlertCount,
  userMenuRef,
  visibleModules,
}) {
  return (
    <header className="topbar">
      <HeaderModuleSummary activeModule={activeModule} />

      <div className="topbar-controls">
        <HeaderSearch
          activateModule={activateModule}
          commandMatches={commandMatches}
          globalSearch={globalSearch}
          globalSearchRef={globalSearchRef}
          handleCommandKeyDown={handleCommandKeyDown}
          searchInputRef={searchInputRef}
          setGlobalSearch={setGlobalSearch}
        />
        <HeaderAlerts
          activeAlertCount={topbarActiveAlertCount}
          activeModule={activeModule}
          activePeriodLabel={activePeriodLabel}
          activateModule={activateModule}
          alertBadgeTone={topbarAlertBadgeTone}
          alertFilter={topbarAlertFilter}
          alertPriorityText={topbarAlertPriorityText}
          alertRef={topbarAlertRef}
          alerts={topbarAlerts}
          alertSummary={topbarAlertSummary}
          dismissableAlerts={topbarDismissableAlerts}
          dismissedAlertCount={topbarDismissedAlertCount}
          dismissedAlerts={dismissedTopbarAlerts}
          dismissVisibleAlerts={dismissVisibleTopbarAlerts}
          filteredAlerts={filteredTopbarAlerts}
          getDismissKey={getAlertDismissKey}
          lastUpdatedAt={lastUpdatedAt}
          setDismissedAlerts={setDismissedTopbarAlerts}
          setFilter={setTopbarAlertFilter}
          setShowAlerts={setShowTopbarAlerts}
          showAlerts={showTopbarAlerts}
          status={status}
          visibleModules={visibleModules}
        />
        <HeaderPeriodSelector
          activePeriodLabel={activePeriodLabel}
          periodMenuRef={periodMenuRef}
          periodPreset={periodPreset}
          setPeriodPreset={setPeriodPreset}
          setShowPeriodMenu={setShowPeriodMenu}
          showPeriodMenu={showPeriodMenu}
        />
        <HeaderOperationSummary lastUpdatedAt={lastUpdatedAt} session={session} status={status} />
        <HeaderActions
          exportActiveModule={exportActiveModule}
          refreshActiveModule={refreshActiveModule}
          session={session}
          setThemeMode={setThemeMode}
          status={status}
          themeMode={themeMode}
        />
        <HeaderUserMenu
          activeModule={activeModule}
          onLogout={onLogout}
          session={session}
          setShowUserMenu={setShowUserMenu}
          showUserMenu={showUserMenu}
          userMenuRef={userMenuRef}
        />
        <HeaderLogoutAction onLogout={onLogout} />
      </div>
    </header>
  );
}
