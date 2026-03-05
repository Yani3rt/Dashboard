"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitList } from "@/components/habit-list";
import { NoteList } from "@/components/note-list";
import { TaskList, taskViews } from "@/components/task-list";
import { todayKey } from "@/lib/domain/date";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function HomePage() {
  const { state, addTask, addHabit, addNote } = useDashboard();
  const [taskTitle, setTaskTitle] = useState("");
  const [habitName, setHabitName] = useState("");
  const [noteText, setNoteText] = useState("");

  const todayTasks = useMemo(() => taskViews.today(state.tasks), [state.tasks]);
  const completedToday = useMemo(
    () => state.tasks.filter((task) => task.status === "done" && task.updatedAt.startsWith(todayKey())).length,
    [state.tasks],
  );

  const completionPct = state.tasks.length === 0 ? 0 : Math.round((completedToday / state.tasks.length) * 100);

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({ title: taskTitle.trim(), dueDate: todayKey(), priority: "high" });
    setTaskTitle("");
  };

  const submitHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!habitName.trim()) return;
    addHabit(habitName.trim());
    setHabitName("");
  };

  const submitNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    addNote(noteText.trim());
    setNoteText("");
  };

  return (
    <div className="dashboard-grid">
      <Card className="hero card">
        <h2>Today Hub</h2>
        <p>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <div className="progress-wrap">
          <div className="ring" style={{ ["--pct" as string]: `${completionPct}` }}>
            <span>{completionPct}%</span>
          </div>
          <div>
            <h3>Daily Review</h3>
            <p>{completedToday} tasks completed today.</p>
            <p>{state.habits.length} active habits.</p>
          </div>
        </div>
      </Card>

      <Card className="card">
        <div className="section-head">
          <h3>Today Tasks</h3>
        </div>
        <form onSubmit={submitTask} className="inline-form">
          <Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a priority task" />
          <Button type="submit">Add</Button>
        </form>
        <TaskList tasks={todayTasks} />
      </Card>

      <Card className="card">
        <div className="section-head">
          <h3>Habits</h3>
        </div>
        <form onSubmit={submitHabit} className="inline-form">
          <Input value={habitName} onChange={(event) => setHabitName(event.target.value)} placeholder="Add daily habit" />
          <Button type="submit">Create</Button>
        </form>
        <HabitList habits={state.habits} />
      </Card>

      <Card className="card">
        <div className="section-head">
          <h3>Quick Notes</h3>
        </div>
        <form onSubmit={submitNote} className="inline-form">
          <Input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Capture a note" />
          <Button type="submit">Save</Button>
        </form>
        <NoteList notes={state.notes.slice(0, 4)} />
      </Card>
    </div>
  );
}
