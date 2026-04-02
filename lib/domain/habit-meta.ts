import { HABIT_COLOR_KEYS, HABIT_ICON_KEYS, HabitColorKey, HabitIconKey } from "@/lib/domain/models";

const hashSeed = (seed: string): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pickBySeed = <T,>(values: readonly T[], seed: string): T => values[hashSeed(seed) % values.length];

export const pickHabitIconBySeed = (seed: string): HabitIconKey => pickBySeed(HABIT_ICON_KEYS, seed);

export const pickHabitColorBySeed = (seed: string): HabitColorKey => pickBySeed(HABIT_COLOR_KEYS, seed);

export const normalizeHabitMeta = (
  input: { id: string; iconKey?: string; colorKey?: string },
): { iconKey: HabitIconKey; colorKey: HabitColorKey } => {
  const iconKey = HABIT_ICON_KEYS.includes(input.iconKey as HabitIconKey)
    ? (input.iconKey as HabitIconKey)
    : pickHabitIconBySeed(input.id);
  const colorKey = HABIT_COLOR_KEYS.includes(input.colorKey as HabitColorKey)
    ? (input.colorKey as HabitColorKey)
    : pickHabitColorBySeed(input.id);

  return { iconKey, colorKey };
};
