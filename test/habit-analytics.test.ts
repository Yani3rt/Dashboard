import { describe, expect, it, vi } from "vitest";
import { completionRate30d, lastNDaysEntries, sparklineBuckets30d, weeklyDots, yearEntries } from "@/lib/domain/habit-analytics";
import { normalizeHabitMeta } from "@/lib/domain/habit-meta";
import { Habit } from "@/lib/domain/models";

const makeHabit = (entryDates: string[]): Habit => ({
  id: "habit-1",
  name: "Meditate",
  iconKey: "sparkles",
  colorKey: "violet",
  targetCadence: "daily",
  entries: entryDates.map((date) => ({ date, completed: true })),
  currentStreak: 0,
  bestStreak: 0,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
});

describe("habit analytics helpers", () => {
  it("builds last N day points and weekly dots", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
    const habit = makeHabit(["2026-03-10", "2026-03-08", "2026-03-05"]);

    const week = weeklyDots(habit);
    expect(week).toHaveLength(7);
    expect(week.filter(Boolean)).toBeTruthy();

    const points = lastNDaysEntries(habit, 30);
    expect(points).toHaveLength(30);
    expect(points.at(-1)?.dateKey).toBe("2026-03-10");
    expect(points.at(-1)?.completed).toBe(true);
    vi.useRealTimers();
  });

  it("computes completion rate and sparkline buckets for 30d", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
    const habit = makeHabit([
      "2026-03-10",
      "2026-03-09",
      "2026-03-08",
      "2026-03-06",
      "2026-03-03",
      "2026-02-28",
      "2026-02-25",
    ]);

    expect(completionRate30d(habit)).toBeGreaterThan(20);
    const bars = sparklineBuckets30d(habit);
    expect(bars).toHaveLength(10);
    expect(Math.max(...bars)).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
  });

  it("returns one point per day for current year heatmap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
    const habit = makeHabit(["2026-01-02", "2026-03-10"]);
    const points = yearEntries(habit, 2026);
    expect(points).toHaveLength(365);
    expect(points[0]?.dateKey).toBe("2026-01-01");
    expect(points.at(-1)?.dateKey).toBe("2026-12-31");
    vi.useRealTimers();
  });
});

describe("habit metadata normalization", () => {
  it("fills missing icon/color deterministically", () => {
    const one = normalizeHabitMeta({ id: "habit-seed-1" });
    const two = normalizeHabitMeta({ id: "habit-seed-1" });
    expect(one).toEqual(two);
  });

  it("keeps valid metadata values", () => {
    const meta = normalizeHabitMeta({ id: "habit-seed-2", iconKey: "book-open", colorKey: "teal" });
    expect(meta.iconKey).toBe("book-open");
    expect(meta.colorKey).toBe("teal");
  });
});
