"use client";

import { Check, Flame } from "lucide-react";
import { normalizeHabitMeta } from "@/lib/domain/habit-meta";
import { todayKey } from "@/lib/domain/date";
import { completionRate30d, sparklineBuckets30d, weeklyDots, yearEntries, type YearHeatPoint } from "@/lib/domain/habit-analytics";
import { Habit } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";
import { HABIT_COLOR_STYLES, HABIT_ICON_COMPONENTS } from "@/components/habit-visuals";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const yearGridByWeek = (points: YearHeatPoint[]): (YearHeatPoint | null)[][] => {
  if (points.length === 0) return [];
  const firstDate = new Date(`${points[0].dateKey}T00:00:00`);
  const leading = firstDate.getDay();
  const cells: (YearHeatPoint | null)[] = [...Array.from({ length: leading }, () => null), ...points];
  const remainder = cells.length % 7;
  if (remainder > 0) {
    cells.push(...Array.from({ length: 7 - remainder }, () => null));
  }

  const weeks: (YearHeatPoint | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
};

export const HabitList = ({ habits }: { habits: Habit[] }) => {
  const { toggleHabitForToday } = useDashboard();

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty">No habits yet.</p>
        <p className="empty-hint">Create your first habit to start your streak.</p>
      </div>
    );
  }

  return (
    <ul className="habit-cards">
      {habits.map((habit) => {
        const meta = normalizeHabitMeta({ id: habit.id, iconKey: habit.iconKey, colorKey: habit.colorKey });
        const Icon = HABIT_ICON_COMPONENTS[meta.iconKey];
        const color = HABIT_COLOR_STYLES[meta.colorKey];
        const todayDone = habit.entries.some((entry) => entry.date === todayKey() && entry.completed);
        const week = weeklyDots(habit, 7);
        const rate = completionRate30d(habit);
        const bars = sparklineBuckets30d(habit);
        const heatmapYear = yearEntries(habit);
        const weekColumns = yearGridByWeek(heatmapYear);

        return (
          <li key={habit.id} className="habit-card-row">
            <div className="habit-card-head">
              <button
                type="button"
                className={`habit-icon-badge habit-icon-button${todayDone ? " is-done" : ""}`}
                style={{ background: color.soft, borderColor: color.ring, color: color.solid }}
                onClick={() => toggleHabitForToday(habit.id)}
                aria-label={todayDone ? `Undo ${habit.name} for today` : `Mark ${habit.name} for today`}
              >
                {todayDone ? <Check size={18} /> : <Icon size={18} />}
              </button>
              <div className="habit-meta">
                <div className="habit-title-row">
                  <h4 className={todayDone ? "habit-name-done" : ""}>{habit.name}</h4>
                  {habit.currentStreak > 0 ? (
                    <span className="habit-streak-text">
                      <Flame size={13} style={{ color: color.solid }} />
                      {habit.currentStreak}
                    </span>
                  ) : null}
                </div>
                <div className="habit-weekline">
                  {week.map((done, index) => (
                    <span
                      key={`${habit.id}-w-${index}`}
                      className="habit-week-dot"
                      style={{ background: done ? color.solid : "hsl(var(--muted))", opacity: done ? 1 : 0.35 }}
                    />
                  ))}
                  <span className="habit-week-caption">7d</span>
                  <span className="habit-week-caption">~ {rate}% / 30d</span>
                </div>
              </div>
              <div className="habit-sparkline-wrap">
                <span>30d</span>
                <div className="habit-sparkline" aria-hidden>
                  {bars.map((height, index) => (
                    <span
                      key={`${habit.id}-bar-${index}`}
                      className="habit-spark-bar"
                      style={{ height: `${height * 4}px`, background: color.solid }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="habit-heatmap" role="img" aria-label={`${habit.name} completion heatmap for the current year`}>
              {weekColumns.map((week, weekIndex) => (
                <div key={`${habit.id}-week-${weekIndex}`} className="habit-heat-week">
                  {week.map((point, dayIndex) => {
                    if (!point) {
                      return <span key={`${habit.id}-pad-${weekIndex}-${dayIndex}`} className="habit-heat-cell is-pad" aria-hidden />;
                    }
                    const dateLabel = new Date(`${point.dateKey}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const statusLabel = point.completed ? "Completed" : point.isFuture ? "Future" : "Missed";
                    return (
                      <Tooltip key={`${habit.id}-${point.dateKey}`}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="habit-heat-cell"
                            aria-label={`${dateLabel} ${statusLabel}`}
                            style={{
                              background: point.completed ? color.solid : "hsl(var(--muted))",
                              opacity: point.completed ? 0.95 : point.isFuture ? 0.1 : 0.22,
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{`${dateLabel} · ${statusLabel}`}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
