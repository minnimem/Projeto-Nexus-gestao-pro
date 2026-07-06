export async function loadDashboardSnapshot({
  active,
  loadCriticalCount,
  loadModuleData,
  now = () => new Date(),
  session,
}) {
  const [data, financeCriticalCount] = await Promise.all([
    loadModuleData(active, session),
    loadCriticalCount(session),
  ]);

  return {
    data,
    financeCriticalCount,
    lastUpdatedAt: now(),
    status: "success",
  };
}
