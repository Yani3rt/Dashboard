"use client";

import { FormEvent, useMemo, useState } from "react";
import { Flame, Plus, Sparkles } from "lucide-react";
import { HabitList } from "@/components/habit-list";
import { HABIT_COLOR_STYLES, HABIT_ICON_COMPONENTS, HABIT_ICON_LABELS } from "@/components/habit-visuals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { todayKey } from "@/lib/domain/date";
import { normalizeHabitMeta } from "@/lib/domain/habit-meta";
import { HABIT_COLOR_KEYS, HABIT_ICON_KEYS, HabitColorKey, HabitIconKey } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

const daySubtitle = (weekday: string): string => {
  if (weekday === "Monday") return "Reset and begin strong.";
  if (weekday === "Friday") return "Finish the week with intention.";
  if (weekday === "Saturday" || weekday === "Sunday") return "Consistency counts on weekends too.";
  return "Let's make today count.";
};

export default function HabitsPage() {
  const { state, addHabit } = useDashboard();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState<HabitIconKey | null>(null);
  const [colorKey, setColorKey] = useState<HabitColorKey | null>(null);

  const today = todayKey();
  const weekday = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const dateLabel = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  const doneToday = useMemo(
    () => state.habits.filter((habit) => habit.entries.some((entry) => entry.date === today && entry.completed)).length,
    [state.habits, today],
  );
  const totalHabits = state.habits.length;
  const progressPct = totalHabits === 0 ? 0 : Math.round((doneToday / totalHabits) * 100);

  const streakHabits = useMemo(
    () =>
      [...state.habits]
        .filter((habit) => habit.currentStreak > 0)
        .sort((a, b) => b.currentStreak - a.currentStreak || a.name.localeCompare(b.name))
        .slice(0, 8),
    [state.habits],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !iconKey || !colorKey) return;
    addHabit({ name: name.trim(), iconKey, colorKey });
    setName("");
    setIconKey(null);
    setColorKey(null);
    setOpen(false);
  };

  return (
    <div className="stack-page">
      <Card className="card habits-hero">
        <div className="habits-hero-head">
          <div>
            <p className="habits-hero-date">{dateLabel}</p>
            <h1>{weekday}</h1>
            <p className="habits-hero-subtitle">
              <Sparkles size={14} />
              {daySubtitle(weekday)}
            </p>
          </div>
          <div className="habits-hero-count">
            <strong>
              {doneToday}/{totalHabits}
            </strong>
            <span>habits done</span>
          </div>
        </div>
        <div className="habits-progress-track" aria-label={`Today's habit progress ${progressPct}%`}>
          <div className="habits-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </Card>

      <section className="habits-section-head">
        <div>
          <h2>
            <Flame size={16} />
            Active Streaks
          </h2>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus size={14} />
          New Habit
        </Button>
      </section>

      <div className="habit-streak-grid">
        {streakHabits.length === 0 ? (
          <p className="empty">No streaks yet. Add your first habit to begin.</p>
        ) : (
          streakHabits.map((habit) => {
            const meta = normalizeHabitMeta({ id: habit.id, iconKey: habit.iconKey, colorKey: habit.colorKey });
            const Icon = HABIT_ICON_COMPONENTS[meta.iconKey];
            const color = HABIT_COLOR_STYLES[meta.colorKey];
            return (
              <article key={habit.id} className="habit-streak-chip">
                <span className="habit-streak-icon" style={{ background: color.soft, borderColor: color.ring, color: color.solid }}>
                  <Icon size={15} />
                </span>
                <p title={habit.name}>{habit.name}</p>
                <span className="habit-streak-number" style={{ color: color.solid }}>
                  <Flame size={12} /> {habit.currentStreak}
                </span>
              </article>
            );
          })
        )}
      </div>

      <HabitList habits={state.habits} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="modal-card habits-create-modal">
          <DialogHeader>
            <DialogTitle>New Habit</DialogTitle>
            <DialogDescription>Select a name, icon and color to create your habit.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="stack-form">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Habit name..."
              maxLength={100}
              aria-label="Habit name"
              autoFocus
            />
            <div className="habit-picker-section">
              <h4>Icon</h4>
              <div className="habit-icon-picker">
                {HABIT_ICON_KEYS.map((key) => {
                  const Icon = HABIT_ICON_COMPONENTS[key];
                  const active = iconKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`habit-icon-option${active ? " is-active" : ""}`}
                      onClick={() => setIconKey(key)}
                      aria-label={HABIT_ICON_LABELS[key]}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="habit-picker-section">
              <h4>Color</h4>
              <div className="habit-color-picker">
                {HABIT_COLOR_KEYS.map((key) => {
                  const style = HABIT_COLOR_STYLES[key];
                  const active = colorKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`habit-color-option${active ? " is-active" : ""}`}
                      style={{ background: style.solid }}
                      onClick={() => setColorKey(key)}
                      aria-label={`${key} color`}
                    />
                  );
                })}
              </div>
            </div>
            <Button type="submit" disabled={!name.trim() || !iconKey || !colorKey}>
              Add habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
