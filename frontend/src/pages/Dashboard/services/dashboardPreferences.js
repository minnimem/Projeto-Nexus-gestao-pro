const themeStorageKey = "nexus-one-theme";
const sidebarStorageKey = "nexus-one-sidebar-collapsed";

export function getDashboardThemePreference() {
  return localStorage.getItem(themeStorageKey) || "light";
}

export function saveDashboardThemePreference(theme) {
  localStorage.setItem(themeStorageKey, theme);
}

export function getSidebarCollapsedPreference() {
  return localStorage.getItem(sidebarStorageKey) === "true";
}

export function saveSidebarCollapsedPreference(collapsed) {
  localStorage.setItem(sidebarStorageKey, String(collapsed));
}
