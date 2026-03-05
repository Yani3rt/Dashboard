export const toDateKey = (input: Date): string => {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, "0");
  const day = `${input.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayKey = (): string => toDateKey(new Date());

export const tomorrowKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateKey(d);
};

export const isSameDay = (a: string, b: string): boolean => a === b;
