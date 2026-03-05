"use client";

import { CalendarCheck2, Undo2 } from "lucide-react";
import { todayKey } from "@/lib/domain/date";
import { Habit } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

const weeklyCompletion = (habit: Habit): string => {
  const today = new Date();
  let complete = 0;
  for (let index = 0; index < 7; index += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - index);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    if (habit.entries.some((entry) => entry.date === key && entry.completed)) {
      complete += 1;
    }
  }

  return `${complete}/7`;
};

export const HabitList = ({ habits }: { habits: Habit[] }) => {
  const { toggleHabitForToday } = useDashboard();

  if (habits.length === 0) {
    return <p className="empty">No habits yet.</p>;
  }

  return (
    <ul className="stack-list">
      {habits.map((habit) => {
        const doneToday = habit.entries.some((entry) => entry.date === todayKey() && entry.completed);
        return (
          <li key={habit.id} className="task-row">
            <div>
              <h4>{habit.name}</h4>
              <p>
                Streak: {habit.currentStreak} · Best: {habit.bestStreak} · Week: {weeklyCompletion(habit)}
              </p>
            </div>
            <div className="row-actions">
              <button type="button" onClick={() => toggleHabitForToday(habit.id)}>
                {doneToday ? <Undo2 size={14} /> : <CalendarCheck2 size={14} />}
                {doneToday ? "Undo today" : "Mark today"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
