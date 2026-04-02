"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/state/dashboard-context";

export default function SchoolPage() {
  const { state, addSchoolDays, removeSchoolDays } = useDashboard();
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const schoolDates = useMemo(() => {
    return (state.schoolDays ?? []).map((day) => new Date(`${day}T12:00:00`));
  }, [state.schoolDays]);

  const getDatesFromRange = (range: DateRange): Date[] => {
    if (!range.from) return [];

    const dates: Date[] = [];
    const from = new Date(range.from);
    from.setHours(12, 0, 0, 0);
    const to = range.to ? new Date(range.to) : new Date(range.from);
    to.setHours(12, 0, 0, 0);

    const current = new Date(from);
    while (current <= to) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const handleMarkAsNoSchool = () => {
    if (!rangeDate) return;

    addSchoolDays(getDatesFromRange(rangeDate));
    setRangeDate(undefined);
    setIsDialogOpen(false);
  };

  const handleRemoveNoSchool = () => {
    if (!rangeDate) return;

    removeSchoolDays(getDatesFromRange(rangeDate));
    setRangeDate(undefined);
    setIsDialogOpen(false);
  };

  const handleClearSelection = () => {
    setRangeDate(undefined);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 stack-page">
      <section className="page-intro w-full">
        <div className="page-intro-head">
          <div>
            <h1>Calendar</h1>
            <p>Plan no-school dates and keep your schedule context visible in one place.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <GraduationCap className="mr-2 h-4 w-4" />
                Mark No School
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Mark No School</DialogTitle>
                <DialogDescription>
                  Select a date or a range of dates to mark as &quot;No School&quot;.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-range"
                      className={cn("w-full justify-start px-3 text-left font-normal", !rangeDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rangeDate?.from ? (
                        rangeDate.to ? (
                          <>
                            {format(rangeDate.from, "LLL dd, y")} - {format(rangeDate.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(rangeDate.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={rangeDate?.from}
                      selected={rangeDate}
                      onSelect={setRangeDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-4 flex w-full justify-end gap-2">
                <Button variant="outline" onClick={handleClearSelection} disabled={!rangeDate} className="mr-auto">
                  Clear
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/20 bg-destructive/5 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleRemoveNoSchool}
                  disabled={!rangeDate}
                >
                  Remove Days
                </Button>
                <Button onClick={handleMarkAsNoSchool} disabled={!rangeDate}>
                  Add Days
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="flex h-full w-full flex-col gap-6 overflow-hidden rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex min-h-[400px] w-full flex-1 justify-center overflow-x-auto rounded-xl border border-border/50 bg-background/50 py-8">
          <Calendar
            modifiers={{ noSchool: schoolDates }}
            modifiersClassNames={{ noSchool: "bg-red-500/20 font-bold text-red-500" }}
            className="[--cell-size:3rem] flex w-full min-w-[320px] justify-center [&_.rdp-day]:pointer-events-none [&_.rdp-months]:w-full [&_.rdp-table]:w-full sm:[--cell-size:4rem] md:[--cell-size:4.5rem] md:[&_.rdp-table]:max-w-4xl"
            showOutsideDays={false}
          />
        </div>
      </div>
    </div>
  );
}
