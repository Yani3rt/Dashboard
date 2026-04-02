import { Habit, HabitEntry } from "@/lib/domain/models";
import { toDateKey } from "@/lib/domain/date";

type DayPoint = {
  dateKey: string;
  completed: boolean;
};

const completeMap = (entries: HabitEntry[]): Map<string, boolean> =>
  new Map(entries.map((entry) => [entry.date, Boolean(entry.completed)]));

export const lastNDaysEntries = (habit: Habit, n = 30): DayPoint[] => {
  const map = completeMap(habit.entries);
  const today = new Date();

  return Array.from({ length: n }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (n - 1 - index));
    const dateKey = toDateKey(day);
    return { dateKey, completed: Boolean(map.get(dateKey)) };
  });
};

export const weeklyDots = (habit: Habit, n = 7): boolean[] =>
  lastNDaysEntries(habit, n).map((entry) => entry.completed);

export const completionRate30d = (habit: Habit): number => {
  const points = lastNDaysEntries(habit, 30);
  const complete = points.filter((point) => point.completed).length;
  return Math.round((complete / points.length) * 100);
};

export const sparklineBuckets30d = (habit: Habit, bucketCount = 10): number[] => {
  const points = lastNDaysEntries(habit, 30);
  const bucketSize = Math.ceil(points.length / bucketCount);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const slice = points.slice(index * bucketSize, (index + 1) * bucketSize);
    if (slice.length === 0) return 0;
    return slice.filter((point) => point.completed).length;
  });

  const max = Math.max(...buckets, 1);
  return buckets.map((value) => Math.max(1, Math.round((value / max) * 8)));
};

export type YearHeatPoint = {
  dateKey: string;
  completed: boolean;
  isFuture: boolean;
};

const firstDayOfYear = (year: number): Date => new Date(year, 0, 1);
const lastDayOfYear = (year: number): Date => new Date(year, 11, 31);

export const yearEntries = (habit: Habit, year = new Date().getFullYear()): YearHeatPoint[] => {
  const map = completeMap(habit.entries);
  const todayKey = toDateKey(new Date());
  const start = firstDayOfYear(year);
  const end = lastDayOfYear(year);
  const points: YearHeatPoint[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateKey = toDateKey(current);
    points.push({
      dateKey,
      completed: Boolean(map.get(dateKey)),
      isFuture: dateKey > todayKey,
    });
    current.setDate(current.getDate() + 1);
  }

  return points;
};
