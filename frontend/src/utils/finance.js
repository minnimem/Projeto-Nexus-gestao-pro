export function getAgingBucket(days) {
  if (days <= 7) return "1-7 dias";
  if (days <= 30) return "8-30 dias";
  if (days <= 60) return "31-60 dias";
  return "60+ dias";
}
