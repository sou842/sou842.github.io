"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  addMonths,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  max,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
import { useAI } from "../../_components/ai-provider";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ScheduleTask = {
  _id: string;
  title: string;
  actionType: "weather_report" | "reminder";
  payload?: { phone?: string };
  scheduleType: "one_time" | "recurring";
  runAt?: string;
  intervalMinutes?: number;
  nextRunAt?: string;
  createdAt?: string;
  status: "active" | "paused" | "failed" | "completed";
};

function estimateRunsForDay(task: ScheduleTask, day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  if (task.scheduleType === "one_time") {
    const at = task.runAt || task.nextRunAt;
    if (!at) return 0;
    const run = new Date(at);
    return run >= dayStart && run <= dayEnd ? 1 : 0;
  }

  if (task.status !== "active") return 0;
  if (!task.intervalMinutes || task.intervalMinutes <= 0) return 0;

  const seed = task.nextRunAt || task.runAt || task.createdAt;
  if (!seed) return 0;

  const first = new Date(seed);
  if (first > dayEnd) return 0;

  const effectiveStart = max([first, dayStart]);
  const minutes = differenceInMinutes(dayEnd, effectiveStart);
  if (minutes < 0) return 0;

  return Math.floor(minutes / task.intervalMinutes) + 1;
}

export default function ScheduleCalenderPage() {
  const { setMobileSidebarOpen } = useAI();
  const [viewMonth, setViewMonth] = React.useState(() => startOfMonth(new Date()));

  const { data } = useSWR("/api/schedule/tasks", fetcher);
  const tasks: ScheduleTask[] = data?.data || [];

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayRows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) dayRows.push(days.slice(i, i + 7));

  const taskMap = React.useMemo(() => {
    const map = new Map<string, { tasks: ScheduleTask[]; runs: number }>();

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const taskHits: ScheduleTask[] = [];
      let totalRuns = 0;

      for (const task of tasks) {
        const count = estimateRunsForDay(task, day);
        if (count > 0) {
          taskHits.push(task);
          totalRuns += count;
        }
      }

      map.set(key, { tasks: taskHits, runs: totalRuns });
    }

    return map;
  }, [tasks, days]);

  const monthlyRuns = React.useMemo(() => {
    return days
      .filter((d) => isSameMonth(d, viewMonth))
      .reduce((acc, d) => acc + (taskMap.get(format(d, "yyyy-MM-dd"))?.runs || 0), 0);
  }, [days, viewMonth, taskMap]);

  return (
    <div className="flex h-screen relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <PageHeader
          icon={<CalendarDays />}
          title="Schedule Calendar"
          subtitle="Visual timeline of daily runs and scheduled tasks"
          actions={
            <Link href="/ai/schedule">
              <Button variant="outline" className="rounded-full border-white/20 bg-[#1e2330] text-white hover:bg-[#252c3c]">Back to List</Button>
            </Link>
          }
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-8xl px-5 py-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[#2d3445] bg-[#1a1f2b] p-4">
                <div className="flex items-center gap-2 text-[#b4c0d8] text-xs uppercase tracking-wider">
                  <CalendarDays className="size-4" /> Month
                </div>
                <p className="text-xl text-white mt-2 font-semibold">{format(viewMonth, "MMMM yyyy")}</p>
              </div>
              <div className="rounded-lg border border-[#2d3445] bg-[#1a1f2b] p-4">
                <p className="text-xs text-[#b4c0d8] uppercase tracking-wider">Scheduled Tasks</p>
                <p className="text-xl text-white mt-2 font-semibold">{tasks.length}</p>
              </div>
              <div className="rounded-lg border border-[#2d3445] bg-[#1a1f2b] p-4">
                <p className="text-xs text-[#b4c0d8] uppercase tracking-wider">Estimated Runs (Month)</p>
                <p className="text-xl text-white mt-2 font-semibold">{monthlyRuns}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#2d3445] bg-[#171b25] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3445] bg-[#1c2130]">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-[#3a4258] bg-[#252c3c] text-white hover:bg-[#2e3649]" onClick={() => setViewMonth(subMonths(viewMonth, 1))}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-[#3a4258] bg-[#252c3c] text-white hover:bg-[#2e3649]" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>
                    <ChevronRight className="size-4" />
                  </Button>
                  <h2 className="ml-2 text-sm font-semibold text-white">{format(viewMonth, "MMMM yyyy")}</h2>
                </div>
                <Button variant="outline" className="h-8 rounded-md border-[#3a4258] bg-[#252c3c] text-white hover:bg-[#2e3649]" onClick={() => setViewMonth(startOfMonth(new Date()))}>Today</Button>
              </div>

              <div className="grid grid-cols-7 border-b border-[#2d3445] bg-[#202636]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                  <div key={label} className="text-xs text-[#a7b4cd] px-3 py-2.5 font-medium border-r border-[#2d3445] last:border-r-0">{label}</div>
                ))}
              </div>

              <div className="space-y-0">
                {dayRows.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7">
                    {week.map((day) => {
                      const key = format(day, "yyyy-MM-dd");
                      const dayInfo = taskMap.get(key) || { tasks: [], runs: 0 };
                      const inMonth = isSameMonth(day, viewMonth);
                      return (
                        <div
                          key={key}
                          className={cn(
                            "min-h-32 border-r border-b border-[#2d3445] p-2.5 transition-colors last:border-r-0",
                            inMonth ? "bg-[#171b25]" : "bg-[#121620]",
                            isToday(day) && "bg-[#1d2a47]"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-xs font-medium", inMonth ? "text-white/90" : "text-white/35")}>{format(day, "d")}</span>
                            {dayInfo.runs > 0 && (
                              <span className="text-[10px] rounded bg-[#2f6fed]/20 text-[#9dc1ff] px-1.5 py-0.5">{dayInfo.runs} runs</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            {dayInfo.tasks.slice(0, 2).map((task) => (
                              <div key={`${task._id}-${key}`} className="text-[10px] rounded-full border border-[#3a4258] bg-[#25304a] px-1.5 py-1 text-[#d4def3] truncate">
                                {task.title}
                              </div>
                            ))}
                            {dayInfo.tasks.length > 2 && (
                              <div className="text-[10px] text-[#9ba9c4]">+{dayInfo.tasks.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
