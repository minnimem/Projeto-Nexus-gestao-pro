export function getCommercialReminderCards(pendingCommercialFollowUps) {
  return pendingCommercialFollowUps
    .filter((item) => item.proximaAcao)
    .sort((a, b) => String(a.proximaAcao || "").localeCompare(String(b.proximaAcao || "")))
    .slice(0, 5);
}

export function getCommercialClientTimeline(branchScopedCommercialFollowUps) {
  return branchScopedCommercialFollowUps
    .slice()
    .sort((a, b) => String(b.criadoEm || b.atualizadoEm || b.proximaAcao || "").localeCompare(String(a.criadoEm || a.atualizadoEm || a.proximaAcao || "")))
    .slice(0, 6);
}
