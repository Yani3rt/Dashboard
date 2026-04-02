"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Clock3,
  CheckSquare,
  ChevronsUpDown,
  Command,
  Compass,
  FolderKanban,
  LayoutDashboard,
  Moon,
  NotebookPen,
  PlusSquare,
  Repeat,
  Search,
  Settings,
  Sparkles,
  CalendarDays,
  Sun,
  Waves,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthButton } from "@/components/AuthButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { pickHabitColorBySeed, pickHabitIconBySeed } from "@/lib/domain/habit-meta";
import { useDashboard } from "@/lib/state/dashboard-context";

const links = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: FolderKanban },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/school", label: "Calendar", icon: CalendarDays },
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

const getOrdinalSuffix = (day: number): string => {
  const modHundred = day % 100;
  if (modHundred >= 11 && modHundred <= 13) return "th";
  const modTen = day % 10;
  if (modTen === 1) return "st";
  if (modTen === 2) return "nd";
  if (modTen === 3) return "rd";
  return "th";
};

const formatTopbarDate = (date: Date): string => {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  const day = date.getDate();
  return `${weekday}, ${day}${getOrdinalSuffix(day)} ${month}`;
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider delayDuration={180}>
      <SidebarProvider defaultOpen>
        <ShellLayout>{children}</ShellLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
};

const ShellLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { open, isMobile } = useSidebar();
  const showLabels = open || isMobile;
  const activeLink = links.find((link) => link.href === pathname);
  const currentTime = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const currentDate = formatTopbarDate(new Date());

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("actions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentActionIds, setRecentActionIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENT_ACTIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [quickTask, setQuickTask] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickHabit, setQuickHabit] = useState("");
  const { state, addTask, addNote, addHabit, toggleHabitForToday, setTheme } = useDashboard();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
        setPaletteMode("actions");
        setSelectedIndex(0);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        setCaptureOpen((current) => !current);
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
    const register = (action: PaletteAction) => map.set(action.id, action);

    register({ id: "create-task", label: "Instant create task", group: "create", icon: PlusSquare, run: () => setPaletteMode("create-task") });
    register({ id: "create-note", label: "Instant create note", group: "create", icon: NotebookPen, run: () => setPaletteMode("create-note") });
    register({ id: "create-habit", label: "Instant create habit", group: "create", icon: Repeat, run: () => setPaletteMode("create-habit") });

    links.forEach((link) => {
      register({ id: `route-${link.href}`, label: `Go to ${link.label}`, group: "navigate", icon: Compass, run: () => router.push(link.href) });
    });

    state.tasks.slice(0, 8).forEach((task) => {
      register({ id: `open-task-${task.id}`, label: `Open task: ${task.title}`, group: "tasks", icon: CheckSquare, run: () => router.push("/tasks") });
    });

    state.notes.slice(0, 8).forEach((note) => {
      const title = note.title ?? note.content.slice(0, 30);
      register({ id: `open-note-${note.id}`, label: `Open note: ${title}`, group: "notes", icon: NotebookPen, run: () => router.push("/notes") });
    });

    state.habits.slice(0, 8).forEach((habit) => {
      register({ id: `toggle-habit-${habit.id}`, label: `Toggle habit: ${habit.name}`, group: "habits", icon: Repeat, run: () => toggleHabitForToday(habit.id) });
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
    if (options.length === 0) return;

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
        <form className="stack-form" onSubmit={(event) => {
          event.preventDefault();
          if (!quickTask.trim()) return;
          addTask({ title: quickTask.trim(), priority: "medium" });
          setQuickTask("");
          closePalette();
        }}>
          <label htmlFor="palette-task">Task title</label>
          <Input 
            id="palette-task" 
            autoFocus 
            value={quickTask} 
            onChange={(event) => setQuickTask(event.target.value)} 
            placeholder="Create a task instantly" 
            maxLength={200}
            aria-describedby="palette-task-hint"
          />
          <small id="palette-task-hint" className="ui-meta-label text-muted-foreground">Maximum 200 characters</small>
          <div className="modal-actions">
            <Button type="submit">Create task</Button>
            <Button type="button" variant="ghost" onClick={() => setPaletteMode("actions")}>Back</Button>
          </div>
        </form>
      );
    }

    if (paletteMode === "create-note") {
      return (
        <form className="stack-form" onSubmit={(event) => {
          event.preventDefault();
          if (!quickNote.trim()) return;
          addNote(quickNote.trim());
          setQuickNote("");
          closePalette();
        }}>
          <label htmlFor="palette-note">Note content</label>
          <Textarea 
            id="palette-note" 
            autoFocus 
            value={quickNote} 
            onChange={(event) => setQuickNote(event.target.value)} 
            rows={5} 
            placeholder="Capture a note instantly" 
            maxLength={50000}
          />
          <div className="modal-actions">
            <Button type="submit">Create note</Button>
            <Button type="button" variant="ghost" onClick={() => setPaletteMode("actions")}>Back</Button>
          </div>
        </form>
      );
    }

    if (paletteMode === "create-habit") {
      return (
        <form className="stack-form" onSubmit={(event) => {
          event.preventDefault();
          if (!quickHabit.trim()) return;
          const name = quickHabit.trim();
          addHabit({
            name,
            iconKey: pickHabitIconBySeed(name),
            colorKey: pickHabitColorBySeed(name),
          });
          setQuickHabit("");
          closePalette();
        }}>
          <label htmlFor="palette-habit">Habit name</label>
          <Input 
            id="palette-habit" 
            autoFocus 
            value={quickHabit} 
            onChange={(event) => setQuickHabit(event.target.value)} 
            placeholder="Create a habit instantly" 
            maxLength={100}
          />
          <div className="modal-actions">
            <Button type="submit">Create habit</Button>
            <Button type="button" variant="ghost" onClick={() => setPaletteMode("actions")}>Back</Button>
          </div>
        </form>
      );
    }

    let flatIndex = -1;

    return (
      <>
        <Input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedIndex(0);
          }}
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
                      <Button type="button" variant="outline" className={active ? "palette-item active" : "palette-item"} onMouseEnter={() => setSelectedIndex(flatIndex)} onClick={() => executeAction(option)}>
                        <option.icon size={14} />
                        {option.label}
                      </Button>
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
      <>
      <Sidebar className="shell-sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className={showLabels ? "shell-brand h-auto justify-start" : "shell-brand h-12 justify-center"}>
                <div className="shell-brand-mark">
                  <Sparkles className="h-4 w-4" />
                </div>
                {showLabels ? (
                  <div className="shell-brand-copy">
                    <span className="truncate font-semibold">Night Shift OS</span>
                    <span className="ui-meta-label truncate text-sidebar-foreground/70">Dashboard Console</span>
                  </div>
                ) : null}
                {showLabels ? <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/60" /> : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {showLabels ? <SidebarGroupLabel>Destinations</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={pathname === link.href} className={showLabels ? "justify-start" : "justify-center"}>
                      <Link href={link.href}>
                        <link.icon className="h-4 w-4" />
                        {showLabels ? <span>{link.label}</span> : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className={showLabels ? "shell-profile h-auto justify-start" : "shell-profile h-12 justify-center"}>
                <UserCircle2 className="h-5 w-5" />
                {showLabels ? (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">You</span>
                    <span className="ui-meta-label truncate text-sidebar-foreground/70">Local session online</span>
                  </div>
                ) : null}
                {showLabels ? <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/60" /> : null}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => router.push("/settings")}>Open Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Dark Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                Light Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="shell-main">
          <header className="shell-topbar">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="shell-topbar-copy">
                <p className="shell-topbar-label">{currentDate}</p>
                <div className="shell-topbar-title-row">
                  <h1 className="shell-topbar-title">{activeLink?.label ?? "Dashboard"}</h1>
                  <span className="shell-status shell-status-live">
                    <Activity className="h-3.5 w-3.5" />
                    Live local
                  </span>
                </div>
              </div>
            </div>
            <div className="shell-topbar-actions">
              <button type="button" className="shell-pill" onClick={() => setPaletteOpen(true)}>
                <Command className="h-3.5 w-3.5" />
                <span>Explore</span>
                <span className="shell-keycap">⌘K</span>
              </button>
              <button type="button" className="shell-pill" onClick={() => setCaptureOpen(true)}>
                <Waves className="h-3.5 w-3.5" />
                <span>Quick Capture</span>
              </button>
              <div className="shell-status">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{currentTime}</span>
              </div>
              <AuthButton />
            </div>
          </header>

          <main className="content shell-content">{children}</main>
        </div>
      </SidebarInset>

      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent className="modal-card">
          <DialogHeader className="modal-header">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>
              Search actions, navigate sections, and create tasks, notes, or habits without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>
          <div className="palette-shortcuts">
            <Button type="button" variant="ghost" onClick={() => {
              setPaletteMode("actions");
              setSelectedIndex(0);
            }}><Search size={14} />Actions</Button>
            <Button type="button" variant="ghost" onClick={() => {
              setPaletteMode("create-task");
              setSelectedIndex(0);
            }}><PlusSquare size={14} />New Task</Button>
            <Button type="button" variant="ghost" onClick={() => {
              setPaletteMode("create-note");
              setSelectedIndex(0);
            }}><NotebookPen size={14} />New Note</Button>
            <Button type="button" variant="ghost" onClick={() => {
              setPaletteMode("create-habit");
              setSelectedIndex(0);
            }}><Repeat size={14} />New Habit</Button>
          </div>
          {renderPaletteContent()}
        </DialogContent>
      </Dialog>

      <QuickCapture open={captureOpen} onOpenChange={setCaptureOpen} />
    </>
  );
};

const QuickCapture = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addTask, addNote } = useDashboard();

  const handleSaveTask = () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    addTask({ title: text.trim() });
    setText("");
    setSubmitting(false);
    onOpenChange(false);
  };

  const handleSaveNote = () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    addNote(text.trim());
    setText("");
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-card">
        <DialogHeader className="modal-header">
          <DialogTitle>Quick Capture Inbox</DialogTitle>
          <DialogDescription>
            Capture a thought quickly and save it as either a task or a note.
          </DialogDescription>
        </DialogHeader>
        <Textarea 
          value={text} 
          onChange={(event) => setText(event.target.value)} 
          rows={5} 
          placeholder="Capture thought, task, or note..." 
          maxLength={50000}
        />
        <div className="modal-actions">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleSaveTask}
            disabled={submitting || !text.trim()}
          >
            <PlusSquare size={14} />
            Save as Task
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleSaveNote}
            disabled={submitting || !text.trim()}
          >
            <NotebookPen size={14} />
            Save as Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
