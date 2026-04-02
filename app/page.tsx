"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitList } from "@/components/habit-list";
import { TaskList, taskViews } from "@/components/task-list";
import { pickHabitColorBySeed, pickHabitIconBySeed } from "@/lib/domain/habit-meta";
import { toDateKey, todayKey } from "@/lib/domain/date";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function HomePage() {
  const { state, hydrated, addTask, addHabit } = useDashboard();
  const [taskTitle, setTaskTitle] = useState("");
  const [habitName, setHabitName] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [habitSubmitting, setHabitSubmitting] = useState(false);

  const todayTasks = useMemo(() => taskViews.today(state.tasks), [state.tasks]);
  const completedToday = useMemo(
    () => state.tasks.filter((task) => task.status === "done" && task.updatedAt.startsWith(todayKey())).length,
    [state.tasks],
  );
  const todayTotal = todayTasks.length + completedToday;
  const completionPct = todayTotal === 0 ? 0 : Math.round((completedToday / todayTotal) * 100);
  const schoolDaysSet = useMemo(() => new Set(state.schoolDays ?? []), [state.schoolDays]);
  const weekCalendar = useMemo(() => {
    const today = new Date();
    const anchor = new Date(today);
    const todayString = today.toDateString();
    anchor.setHours(12, 0, 0, 0);

    if (anchor.getDay() === 6) {
      anchor.setDate(anchor.getDate() + 2);
    }

    if (anchor.getDay() === 0) {
      anchor.setDate(anchor.getDate() + 1);
    }

    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      day.setHours(12, 0, 0, 0);

      const dateKey = toDateKey(day);
      return {
        key: dateKey,
        weekday: day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
        dayOfMonth: day.getDate(),
        isToday: day.toDateString() === todayString,
        isNoSchool: schoolDaysSet.has(dateKey),
      };
    });
  }, [schoolDaysSet]);

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskTitle.trim() || taskSubmitting) return;
    setTaskSubmitting(true);
    addTask({ title: taskTitle.trim(), dueDate: todayKey(), priority: "high" });
    setTaskTitle("");
    setTaskSubmitting(false);
  };

  const submitHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!habitName.trim() || habitSubmitting) return;
    setHabitSubmitting(true);
    const name = habitName.trim();
    addHabit({
      name,
      iconKey: pickHabitIconBySeed(name),
      colorKey: pickHabitColorBySeed(name),
    });
    setHabitName("");
    setHabitSubmitting(false);
  };

  if (!hydrated) {
    return (
      <div className="dashboard-grid">
        <Card className="card">
          <p className="shell-topbar-label">[LOADING...]</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <Card className="hero card hero-stage">
        <div className="hero-stat-grid">
          <div className="hero-stat">
            <span>Queued Focus</span>
            <strong>{todayTasks.length}</strong>
            <small>tasks ready for action</small>
          </div>
          <div className="hero-stat">
            <span>Habit Momentum</span>
            <strong>{state.habits.length}</strong>
            <small>routines in rotation</small>
          </div>
          <div className="hero-stat">
            <span>Today Status</span>
            <strong>{completionPct}%</strong>
            <small>session completion</small>
          </div>
        </div>
      </Card>

      <Card className="card focus-panel">
        <div className="section-head">
          <div>
            <h3>Today Tasks</h3>
            <p className="section-subtitle">Priority missions ready for the current session.</p>
          </div>
        </div>
        <form onSubmit={submitTask} className="inline-form">
          <Input 
            id="today-task-input"
            value={taskTitle} 
            onChange={(event) => setTaskTitle(event.target.value)} 
            placeholder="Add a priority task" 
            maxLength={200}
            aria-label="Task title"
          />
          <Button type="submit" disabled={taskSubmitting || !taskTitle.trim()}>Add</Button>
        </form>
        <TaskList tasks={todayTasks} />
      </Card>

      <Card className="card focus-panel">
        <div className="section-head">
          <div>
            <h3>Habits</h3>
            <p className="section-subtitle">Keep recurring actions in motion with one-tap tracking.</p>
          </div>
        </div>
        <form onSubmit={submitHabit} className="inline-form">
          <Input 
            value={habitName} 
            onChange={(event) => setHabitName(event.target.value)} 
            placeholder="Add daily habit" 
            maxLength={100}
            aria-label="Habit name"
          />
          <Button type="submit" disabled={habitSubmitting || !habitName.trim()}>Create</Button>
        </form>
        <HabitList habits={state.habits} />
      </Card>

      <Card className="card focus-panel">
        <div className="section-head">
          <div>
            <h3>No School Snapshot</h3>
            <p className="section-subtitle">This week at a glance from your no-school calendar.</p>
          </div>
        </div>
        <div className="school-week-row" role="list" aria-label="Current calendar week">
          {weekCalendar.map((day) => (
            <div
              key={day.key}
              role="listitem"
              className={`school-week-day${day.isToday ? " is-today" : ""}${day.isNoSchool ? " is-no-school" : ""}`}
              aria-label={`${day.weekday} ${day.dayOfMonth}${day.isNoSchool ? " no school" : ""}`}
            >
              <span className="school-week-label">{day.weekday}</span>
              <span className="school-week-date">{day.dayOfMonth}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
