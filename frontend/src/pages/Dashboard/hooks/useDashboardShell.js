import { useEffect, useMemo, useRef, useState } from "react";
import { formatPeriodRange, getPeriodPresetRange } from "../../../utils/formatters";
import { getAccessibleModules } from "../../../utils/permissions";
import {
  getDashboardThemePreference,
  getSidebarCollapsedPreference,
  saveDashboardThemePreference,
  saveSidebarCollapsedPreference,
} from "../services/dashboardPreferences";
import {
  getActiveDashboardModule,
  getDashboardCommandMatches,
  getDashboardQuickActions,
} from "../viewModels/dashboardShellViewModel";
import { useDashboardShellEvents } from "./useDashboardShellEvents";

export function useDashboardShell({ session }) {
  const [active, setActive] = useState("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [periodPreset, setPeriodPreset] = useState("month");
  const [themeMode, setThemeMode] = useState(getDashboardThemePreference);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getSidebarCollapsedPreference);
  const searchInputRef = useRef(null);
  const globalSearchRef = useRef(null);
  const periodMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const visibleModules = useMemo(() => getAccessibleModules(session), [session]);
  const activeModule = useMemo(
    () => getActiveDashboardModule(active, visibleModules),
    [active, visibleModules],
  );
  const commandMatches = useMemo(
    () => getDashboardCommandMatches(globalSearch, visibleModules),
    [globalSearch, visibleModules],
  );
  const quickActions = useMemo(
    () => getDashboardQuickActions(active, visibleModules),
    [active, visibleModules],
  );
  const activePeriodRange = useMemo(() => getPeriodPresetRange(periodPreset), [periodPreset]);
  const activePeriodLabel = useMemo(() => formatPeriodRange(periodPreset), [periodPreset]);

  useEffect(() => saveDashboardThemePreference(themeMode), [themeMode]);
  useEffect(() => saveSidebarCollapsedPreference(sidebarCollapsed), [sidebarCollapsed]);

  useEffect(() => {
    if (!visibleModules.some((module) => module.value === active)) {
      setActive(visibleModules[0].value || "overview");
    }
  }, [active, visibleModules]);

  useDashboardShellEvents({
    globalSearchRef,
    periodMenuRef,
    searchInputRef,
    setGlobalSearch,
    setShowPeriodMenu,
    setShowUserMenu,
    userMenuRef,
  });

  function activateModule(moduleValue) {
    setActive(moduleValue);
    setGlobalSearch("");
    setShowPeriodMenu(false);
    setShowUserMenu(false);
  }

  function handleCommandKeyDown(event) {
    if (event.key === "Enter" && commandMatches[0]) {
      event.preventDefault();
      activateModule(commandMatches[0].value);
    }
    if (event.key === "Escape") {
      setGlobalSearch("");
      searchInputRef.current.blur();
    }
  }

  return {
    active,
    activeModule,
    activePeriodLabel,
    activePeriodRange,
    activateModule,
    commandMatches,
    globalSearch,
    globalSearchRef,
    handleCommandKeyDown,
    periodMenuRef,
    periodPreset,
    quickActions,
    searchInputRef,
    setGlobalSearch,
    setPeriodPreset,
    setShowPeriodMenu,
    setShowUserMenu,
    setThemeMode,
    showPeriodMenu,
    showUserMenu,
    sidebarCollapsed,
    themeMode,
    toggleSidebar: () => setSidebarCollapsed((current) => !current),
    userMenuRef,
    visibleModules,
  };
}
