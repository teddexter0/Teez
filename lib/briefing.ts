import type { Trend } from './catalog';

export const durations = [5, 10, 15, 20] as const;
export type Minutes = (typeof durations)[number];
export type BriefingSlot = { trend: Trend; seconds: number };

// Give the explanation its own reading beat; the motion clip ends separately.
export const contextSeconds = 34;

export function planBriefing(
  catalog: readonly Trend[],
  minutes: Minutes,
  learned: readonly string[] = [],
): BriefingSlot[] {
  const remainingTrends = new Map<string, Trend>();
  for (const trend of catalog) {
    if (trend.seconds >= 2.5 && trend.seconds <= 10 && !remainingTrends.has(trend.id)) {
      remainingTrends.set(trend.id, trend);
    }
  }

  const familiar = new Set(learned);
  const platformCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const slots: BriefingSlot[] = [];
  let remainingSeconds = minutes * 60;

  while (remainingTrends.size > 0) {
    const previous = slots.at(-1)?.trend;
    let choice: Trend | undefined;
    let bestScore = Infinity;
    for (const trend of remainingTrends.values()) {
      if (trend.seconds + contextSeconds > remainingSeconds) continue;
      // Unseen topics always rank first. Within that group, favor variety and
      // use catalog order as a deterministic tie-break for the edition.
      const score =
        (familiar.has(trend.id) ? 10_000 : 0) +
        (trend.platform === previous?.platform ? 100 : 0) +
        (trend.category === previous?.category ? 100 : 0) +
        (platformCounts.get(trend.platform) ?? 0) +
        (categoryCounts.get(trend.category) ?? 0);
      if (score < bestScore) {
        choice = trend;
        bestScore = score;
      }
    }
    if (!choice) break;

    const seconds = choice.seconds + contextSeconds;
    slots.push({ trend: choice, seconds });
    remainingSeconds -= seconds;
    remainingTrends.delete(choice.id);
    platformCounts.set(choice.platform, (platformCounts.get(choice.platform) ?? 0) + 1);
    categoryCounts.set(choice.category, (categoryCounts.get(choice.category) ?? 0) + 1);
  }

  return slots;
}

export function localDateKey(date = new Date()): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
