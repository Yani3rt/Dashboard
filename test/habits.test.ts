import { describe, expect, it, vi } from "vitest";
import { calculateStreak } from "@/lib/domain/habits";

describe("calculateStreak", () => {
  it("returns current and best streak for consecutive completions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T10:00:00Z"));

    const streak = calculateStreak([
      { date: "2026-03-03", completed: true },
      { date: "2026-03-04", completed: true },
      { date: "2026-03-05", completed: true },
    ]);

    expect(streak.current).toBe(3);
    expect(streak.best).toBe(3);

    vi.useRealTimers();
  });

  it("resets current streak after missing more than one day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T10:00:00Z"));

    const streak = calculateStreak([
      { date: "2026-03-01", completed: true },
      { date: "2026-03-02", completed: true },
    ]);

    expect(streak.current).toBe(0);
    expect(streak.best).toBe(2);

    vi.useRealTimers();
  });
});
