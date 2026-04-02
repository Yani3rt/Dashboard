import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pickHabitColorBySeed, pickHabitIconBySeed } from "@/lib/domain/habit-meta";
import { DashboardProvider, useDashboard } from "@/lib/state/dashboard-context";

const Harness = () => {
  const {
    state,
    addTask,
    updateTaskStatus,
    addHabit,
    toggleHabitForToday,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    exportBackup,
    importBackup,
  } = useDashboard();

  return (
    <div>
      <button onClick={() => addTask({ title: "Ship V1", priority: "high" })} type="button">
        add task
      </button>
      <button
        onClick={() => {
          const first = state.tasks[0];
          if (first) {
            updateTaskStatus(first.id, "done");
          }
        }}
        type="button"
      >
        complete task
      </button>
      <button
        onClick={() =>
          addHabit({
            name: "Workout",
            iconKey: pickHabitIconBySeed("Workout"),
            colorKey: pickHabitColorBySeed("Workout"),
          })
        }
        type="button"
      >
        add habit
      </button>
      <button onClick={() => addNote("Initial note", "Draft", ["inbox"])} type="button">
        add note
      </button>
      <button
        onClick={() => {
          const first = state.notes[0];
          if (first) {
            updateNote(first.id, { title: "Edited", content: "Edited note body", tags: ["edited"] });
          }
        }}
        type="button"
      >
        edit note
      </button>
      <button
        onClick={() => {
          const first = state.notes[0];
          if (first) {
            deleteNote(first.id);
          }
        }}
        type="button"
      >
        delete note
      </button>
      <button
        onClick={() => {
          const first = state.notes[0];
          const second = state.notes[1];
          if (first && second) {
            reorderNotes(first.id, second.id, state.notes.map((note) => note.id));
          }
        }}
        type="button"
      >
        reorder notes
      </button>
      <button
        onClick={() => {
          const first = state.habits[0];
          if (first) {
            toggleHabitForToday(first.id);
          }
        }}
        type="button"
      >
        toggle habit
      </button>
      <button
        onClick={() => {
          const backup = exportBackup();
          window.localStorage.setItem("test-backup", JSON.stringify(backup));
        }}
        type="button"
      >
        export
      </button>
      <button
        onClick={() => {
          const raw = window.localStorage.getItem("test-backup");
          if (!raw) {
            return;
          }
          const payload = JSON.parse(raw);
          importBackup(payload);
        }}
        type="button"
      >
        import
      </button>
      <button
        onClick={() => {
          const invalid = { version: 999, state: { tasks: [], habits: [], notes: [], theme: "dark" } };
          const result = importBackup(invalid as never);
          window.localStorage.setItem("invalid-import", result.ok ? "ok" : "error");
        }}
        type="button"
      >
        invalid import
      </button>
      <p data-testid="task-status">{state.tasks[0]?.status ?? "none"}</p>
      <p data-testid="habit-streak">{state.habits[0]?.currentStreak ?? 0}</p>
      <p data-testid="note-title">{state.notes[0]?.title ?? "none"}</p>
      <p data-testid="note-count">{state.notes.length}</p>
      <p data-testid="note-top-content">{state.notes[0]?.content ?? "none"}</p>
    </div>
  );
};

describe("dashboard provider flows", () => {
  it("creates and completes tasks", async () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "add task" }));
    fireEvent.click(screen.getByRole("button", { name: "complete task" }));

    expect(screen.getByTestId("task-status")).toHaveTextContent("done");
  });

  it("updates habit streak after toggle", () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "add habit" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle habit" }));

    expect(screen.getByTestId("habit-streak")).toHaveTextContent("1");
  });

  it("rejects unsupported backup version", () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "invalid import" }));

    expect(window.localStorage.getItem("invalid-import")).toBe("error");
  });

  it("imports legacy backup and normalizes habit metadata", () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    const legacy = {
      version: 1,
      exportedAt: "2026-03-10T00:00:00.000Z",
      state: {
        tasks: [],
        habits: [
          {
            id: "legacy-habit",
            name: "Read",
            targetCadence: "daily",
            entries: [],
            currentStreak: 0,
            bestStreak: 0,
            createdAt: "2026-03-10T00:00:00.000Z",
            updatedAt: "2026-03-10T00:00:00.000Z",
          },
        ],
        notes: [],
        theme: "dark",
        schoolDays: [],
      },
    };

    window.localStorage.setItem("test-backup", JSON.stringify(legacy));
    fireEvent.click(screen.getByRole("button", { name: "import" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle habit" }));

    expect(screen.getByTestId("habit-streak")).toHaveTextContent("1");
  });

  it("edits and deletes notes", () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "add note" }));
    fireEvent.click(screen.getByRole("button", { name: "edit note" }));
    expect(screen.getByTestId("note-title")).toHaveTextContent("Edited");

    fireEvent.click(screen.getByRole("button", { name: "delete note" }));
    expect(screen.getByTestId("note-count")).toHaveTextContent("0");
  });

  it("reorders notes", () => {
    render(
      <DashboardProvider>
        <Harness />
      </DashboardProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "add note" }));
    fireEvent.click(screen.getByRole("button", { name: "add note" }));
    fireEvent.click(screen.getByRole("button", { name: "reorder notes" }));

    expect(screen.getByTestId("note-top-content")).toHaveTextContent("Initial note");
  });
});
