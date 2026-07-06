import { useEffect } from "react";

export function useDashboardShellEvents({
  globalSearchRef,
  periodMenuRef,
  searchInputRef,
  setGlobalSearch,
  setShowPeriodMenu,
  setShowUserMenu,
  userMenuRef,
}) {
  useEffect(() => {
    function handleGlobalShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, [searchInputRef]);

  useEffect(() => {
    function handleShellDismiss(event) {
      if (event.key === "Escape") {
        setGlobalSearch("");
        setShowPeriodMenu(false);
        setShowUserMenu(false);
        return;
      }
      if (event.type !== "mousedown") return;
      const target = event.target;
      if (globalSearchRef.current && !globalSearchRef.current.contains(target)) setGlobalSearch("");
      if (periodMenuRef.current && !periodMenuRef.current.contains(target)) setShowPeriodMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setShowUserMenu(false);
    }

    document.addEventListener("mousedown", handleShellDismiss);
    document.addEventListener("keydown", handleShellDismiss);
    return () => {
      document.removeEventListener("mousedown", handleShellDismiss);
      document.removeEventListener("keydown", handleShellDismiss);
    };
  }, [globalSearchRef, periodMenuRef, setGlobalSearch, setShowPeriodMenu, setShowUserMenu, userMenuRef]);
}
