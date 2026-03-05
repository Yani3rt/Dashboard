import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardProvider, useDashboard } from "@/lib/state/dashboard-context";

const Harness = () => {
  const {
    state,
    addTask,
    updateTaskStatus,
    addHabit,
    toggleHabitForToday,
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
      <button onClick={() => addHabit("Workout")} type="button">
        add habit
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
});
