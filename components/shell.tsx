"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CheckSquare,
  Command,
  Compass,
  LayoutDashboard,
  NotebookPen,
  PlusSquare,
  Repeat,
  Search,
  Settings,
  Sparkles,
  X,
  Inbox,
} from "lucide-react";
import { useDashboard } from "@/lib/state/dashboard-context";

const links = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings },
];

type PaletteMode = "actions" | "create-task" | "create-note" | "create-habit";
type ActionGroup = "recent" | "create" | "navigate" | "tasks" | "notes" | "habits";

type PaletteAction = {
  id: string;
  label: string;
  group: ActionGroup;
  icon: LucideIcon;
  run: () => void;
};

const RECENT_ACTIONS_KEY = "dashboard.palette.recent";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("actions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentActionIds, setRecentActionIds] = useState<string[]>([]);
  const [quickTask, setQuickTask] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickHabit, setQuickHabit] = useState("");
  const { state, addTask, addNote, addHabit, toggleHabitForToday } = useDashboard();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(RECENT_ACTIONS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setRecentActionIds(parsed);
      }
    } catch {
      setRecentActionIds([]);
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        setPaletteMode("actions");
        setSelectedIndex(0);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        setCaptureOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setPaletteMode("actions");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actionMap = useMemo(() => {
    const map = new Map<string, PaletteAction>();

    const register = (action: PaletteAction) => {
      map.set(action.id, action);
    };

    register({ id: "create-task", label: "Instant create task", group: "create", icon: PlusSquare, run: () => setPaletteMode("create-task") });
    register({ id: "create-note", label: "Instant create note", group: "create", icon: NotebookPen, run: () => setPaletteMode("create-note") });
    register({ id: "create-habit", label: "Instant create habit", group: "create", icon: Repeat, run: () => setPaletteMode("create-habit") });

    links.forEach((link) => {
      register({
        id: `route-${link.href}`,
        label: `Go to ${link.label}`,
        group: "navigate",
        icon: Compass,
        run: () => router.push(link.href),
      });
    });

    state.tasks.slice(0, 8).forEach((task) => {
      register({
        id: `open-task-${task.id}`,
        label: `Open task: ${task.title}`,
        group: "tasks",
        icon: CheckSquare,
        run: () => router.push("/tasks"),
      });
    });

    state.notes.slice(0, 8).forEach((note) => {
      const title = note.title ?? note.content.slice(0, 30);
      register({
        id: `open-note-${note.id}`,
        label: `Open note: ${title}`,
        group: "notes",
        icon: NotebookPen,
        run: () => router.push("/notes"),
      });
    });

    state.habits.slice(0, 8).forEach((habit) => {
      register({
        id: `toggle-habit-${habit.id}`,
        label: `Toggle habit: ${habit.name}`,
        group: "habits",
        icon: Repeat,
        run: () => toggleHabitForToday(habit.id),
      });
    });

    return map;
  }, [router, state.habits, state.notes, state.tasks, toggleHabitForToday]);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const fromSearch = [...actionMap.values()].filter((option) => option.label.toLowerCase().includes(normalized));

    const recents = recentActionIds
      .map((id) => actionMap.get(id))
      .filter((value): value is PaletteAction => Boolean(value))
      .map((action) => ({ ...action, group: "recent" as const }));

    return [...recents, ...fromSearch.filter((option) => !recentActionIds.includes(option.id))];
  }, [actionMap, query, recentActionIds]);

  const groupedOptions = useMemo(() => {
    const groups: ActionGroup[] = ["recent", "create", "navigate", "tasks", "notes", "habits"];
    return groups
      .map((group) => ({ group, items: options.filter((option) => option.group === group) }))
      .filter((entry) => entry.items.length > 0);
  }, [options]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, paletteMode, options.length]);

  const closePalette = () => {
    setPaletteOpen(false);
    setPaletteMode("actions");
    setQuery("");
    setSelectedIndex(0);
  };

  const trackRecentAction = (actionId: string) => {
    setRecentActionIds((prev) => {
      const next = [actionId, ...prev.filter((id) => id !== actionId)].slice(0, 6);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const executeAction = (action: PaletteAction) => {
    action.run();
    trackRecentAction(action.id);
    closePalette();
  };

  const onActionInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % options.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + options.length) % options.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = options[selectedIndex] ?? options[0];
      executeAction(selected);
    }
  };

  const renderPaletteContent = () => {
    if (paletteMode === "create-task") {
      return (
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!quickTask.trim()) return;
            addTask({ title: quickTask.trim(), priority: "medium" });
            setQuickTask("");
            closePalette();
          }}
        >
          <label htmlFor="palette-task">Task title</label>
          <input
            id="palette-task"
            autoFocus
            value={quickTask}
            onChange={(event) => setQuickTask(event.target.value)}
            placeholder="Create a task instantly"
          />
          <div className="modal-actions">
            <button type="submit">Create task</button>
            <button type="button" onClick={() => setPaletteMode("actions")}>Back</button>
          </div>
        </form>
      );
    }

    if (paletteMode === "create-note") {
      return (
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!quickNote.trim()) return;
            addNote(quickNote.trim());
            setQuickNote("");
            closePalette();
          }}
        >
          <label htmlFor="palette-note">Note content</label>
          <textarea
            id="palette-note"
            autoFocus
            value={quickNote}
            onChange={(event) => setQuickNote(event.target.value)}
            rows={5}
            placeholder="Capture a note instantly"
          />
          <div className="modal-actions">
            <button type="submit">Create note</button>
            <button type="button" onClick={() => setPaletteMode("actions")}>Back</button>
          </div>
        </form>
      );
    }

    if (paletteMode === "create-habit") {
      return (
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!quickHabit.trim()) return;
            addHabit(quickHabit.trim());
            setQuickHabit("");
            closePalette();
          }}
        >
          <label htmlFor="palette-habit">Habit name</label>
          <input
            id="palette-habit"
            autoFocus
            value={quickHabit}
            onChange={(event) => setQuickHabit(event.target.value)}
            placeholder="Create a habit instantly"
          />
          <div className="modal-actions">
            <button type="submit">Create habit</button>
            <button type="button" onClick={() => setPaletteMode("actions")}>Back</button>
          </div>
        </form>
      );
    }

    let flatIndex = -1;

    return (
      <>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onActionInputKeyDown}
          placeholder="Search actions, routes, tasks, notes, habits"
        />
        <div className="palette-list">
          {groupedOptions.map((section) => (
            <section key={section.group} className="palette-section">
              <h4 className="palette-group-title">{section.group}</h4>
              <ul>
                {section.items.map((option) => {
                  flatIndex += 1;
                  const active = flatIndex === selectedIndex;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        className={active ? "palette-item active" : "palette-item"}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                        onClick={() => executeAction(option)}
                      >
                        <option.icon size={14} />
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {options.length === 0 ? <p className="empty">No matches.</p> : null}
        </div>
      </>
    );
  };

  return (
    <div className="app-frame">
      <aside className="nav-panel">
        <h1>Night Shift Dashboard</h1>
        <p>Personal operating system</p>
        <nav>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "nav-link active" : "nav-link"}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="panel-actions">
          <button onClick={() => setPaletteOpen(true)} type="button">
            <Command size={14} />
            Command Palette
          </button>
          <button onClick={() => setCaptureOpen(true)} type="button">
            <Inbox size={14} />
            Quick Capture
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>

      {paletteOpen ? (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Command Palette</h2>
              <button onClick={closePalette} type="button">
                <X size={14} />
                Close
              </button>
            </div>
            <div className="palette-shortcuts">
              <button type="button" onClick={() => setPaletteMode("actions")}><Search size={14} />Actions</button>
              <button type="button" onClick={() => setPaletteMode("create-task")}><PlusSquare size={14} />New Task</button>
              <button type="button" onClick={() => setPaletteMode("create-note")}><NotebookPen size={14} />New Note</button>
              <button type="button" onClick={() => setPaletteMode("create-habit")}><Repeat size={14} />New Habit</button>
            </div>
            {renderPaletteContent()}
          </div>
        </div>
      ) : null}

      {captureOpen ? <QuickCapture onClose={() => setCaptureOpen(false)} /> : null}
    </div>
  );
};

const QuickCapture = ({ onClose }: { onClose: () => void }) => {
  const [text, setText] = useState("");
  const { addTask, addNote } = useDashboard();

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Quick Capture Inbox</h2>
          <button onClick={onClose} type="button">
            <X size={14} />
            Close
          </button>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          placeholder="Capture thought, task, or note..."
        />
        <div className="modal-actions">
          <button
            type="button"
            onClick={() => {
              if (text.trim()) {
                addTask({ title: text.trim() });
              }
              setText("");
              onClose();
            }}
          >
            <PlusSquare size={14} />
            Save as Task
          </button>
          <button
            type="button"
            onClick={() => {
              if (text.trim()) {
                addNote(text.trim());
              }
              setText("");
              onClose();
            }}
          >
            <NotebookPen size={14} />
            Save as Note
          </button>
        </div>
      </div>
    </div>
  );
};
