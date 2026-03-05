"use client";

import { FormEvent, useState } from "react";
import { HabitList } from "@/components/habit-list";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function HabitsPage() {
  const { state, addHabit } = useDashboard();
  const [name, setName] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    addHabit(name.trim());
    setName("");
  };

  return (
    <div className="stack-page">
      <section className="card">
        <h2>Habit Tracker</h2>
        <form className="inline-form" onSubmit={onSubmit}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Add a daily habit" />
          <button type="submit">Create Habit</button>
        </form>
      </section>
      <section className="card">
        <HabitList habits={state.habits} />
      </section>
    </div>
  );
}
