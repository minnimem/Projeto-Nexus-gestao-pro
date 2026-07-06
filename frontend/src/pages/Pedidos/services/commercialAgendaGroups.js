import {
  getLocalDateKey,
  isDateBeforeToday,
} from "../../../utils/formatters";

export function getCommercialAgendaGroups({ pendingCommercialFollowUps, todayKey }) {
  return [
    { key: "overdue", label: "Vencidos", tone: "overdue", filter: (item) => item.proximaAcao && isDateBeforeToday(item.proximaAcao) },
    { key: "today", label: "Hoje", tone: "today", filter: (item) => getLocalDateKey(item.proximaAcao) === todayKey },
    { key: "next", label: "Próximos", tone: "next", filter: (item) => item.proximaAcao && !isDateBeforeToday(item.proximaAcao) && getLocalDateKey(item.proximaAcao) !== todayKey },
  ].map(({ filter, ...group }) => ({
    ...group,
    items: pendingCommercialFollowUps
      .filter(filter)
      .sort((a, b) => String(a.proximaAcao || "").localeCompare(String(b.proximaAcao || ""))),
  }));
}

export function getDueCommercialFollowUps(pendingCommercialFollowUps, todayKey) {
  return pendingCommercialFollowUps.filter((item) =>
    isDateBeforeToday(item.proximaAcao) || getLocalDateKey(item.proximaAcao) === todayKey,
  );
}
