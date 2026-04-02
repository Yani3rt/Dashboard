"use client";

import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Bike,
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  HeartPulse,
  Monitor,
  Moon,
  Music,
  PenLine,
  Salad,
  ShowerHead,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import type { HabitColorKey, HabitIconKey } from "@/lib/domain/models";

export const HABIT_ICON_COMPONENTS: Record<HabitIconKey, LucideIcon> = {
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  moon: Moon,
  "shower-head": ShowerHead,
  "pen-line": PenLine,
  target: Target,
  droplets: Droplets,
  salad: Salad,
  "bed-double": BedDouble,
  music: Music,
  monitor: Monitor,
  bike: Bike,
  "heart-pulse": HeartPulse,
  brain: Brain,
  timer: Timer,
};

export const HABIT_ICON_LABELS: Record<HabitIconKey, string> = {
  sparkles: "Focus",
  dumbbell: "Workout",
  "book-open": "Read",
  moon: "Sleep",
  "shower-head": "Cold Shower",
  "pen-line": "Journal",
  target: "Target",
  droplets: "Hydration",
  salad: "Nutrition",
  "bed-double": "Rest",
  music: "Music",
  monitor: "Deep Work",
  bike: "Cardio",
  "heart-pulse": "Health",
  brain: "Mind",
  timer: "Routine",
};

export const HABIT_COLOR_STYLES: Record<HabitColorKey, { solid: string; soft: string; ring: string }> = {
  violet: { solid: "#7b5de6", soft: "rgba(123, 93, 230, 0.22)", ring: "rgba(123, 93, 230, 0.42)" },
  green: { solid: "#10b981", soft: "rgba(16, 185, 129, 0.22)", ring: "rgba(16, 185, 129, 0.42)" },
  yellow: { solid: "#f2a600", soft: "rgba(242, 166, 0, 0.22)", ring: "rgba(242, 166, 0, 0.42)" },
  pink: { solid: "#f43f78", soft: "rgba(244, 63, 120, 0.22)", ring: "rgba(244, 63, 120, 0.42)" },
  cyan: { solid: "#17a5d8", soft: "rgba(23, 165, 216, 0.22)", ring: "rgba(23, 165, 216, 0.42)" },
  orange: { solid: "#ff7b00", soft: "rgba(255, 123, 0, 0.22)", ring: "rgba(255, 123, 0, 0.42)" },
  teal: { solid: "#0fb9b1", soft: "rgba(15, 185, 177, 0.22)", ring: "rgba(15, 185, 177, 0.42)" },
};
