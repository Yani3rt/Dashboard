import { HabitEntry } from "@/lib/domain/models";
import { toDateKey } from "@/lib/domain/date";

const sortEntries = (entries: HabitEntry[]): HabitEntry[] =>
  [...entries].sort((a, b) => a.date.localeCompare(b.date));

const previousDateKey = (dateKey: string): string => {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
};

export const calculateStreak = (entries: HabitEntry[]): { current: number; best: number } => {
  const completed = sortEntries(entries).filter((entry) => entry.completed);
  if (completed.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let run = 1;

  for (let i = 1; i < completed.length; i += 1) {
    if (previousDateKey(completed[i].date) === completed[i - 1].date) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  const latest = completed[completed.length - 1].date;
  const yesterday = previousDateKey(toDateKey(new Date()));
  const today = toDateKey(new Date());
  if (latest !== today && latest !== yesterday) {
    return { current: 0, best };
  }

  let current = 1;
  for (let i = completed.length - 1; i > 0; i -= 1) {
    if (previousDateKey(completed[i].date) === completed[i - 1].date) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, best };
};
