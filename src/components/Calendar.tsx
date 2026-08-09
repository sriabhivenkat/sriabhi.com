"use client";
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarTransaction = {
  transId: string;
  amount: number;
  transDate: string; // ISO date string, e.g. "2026-07-16T00:00:00"
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export default function Calendar({
  transactions,
  selectedDate,
  onSelectDate,
  onMonthChange
}: {
  transactions: CalendarTransaction[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onMonthChange?: (date: string) => void;
}) {
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));

  const dailyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      const key = t.transDate.slice(0, 10);
      totals.set(key, (totals.get(key) ?? 0) + t.amount);
    }
    return totals;
  }, [transactions]);

  const todayKey = toDateKey(new Date());

  const cells = useMemo(() => {
    const first = startOfMonth(viewDate);
    const leading = first.getDay(); // 0 = Sunday
    const total = daysInMonth(viewDate);

    const items: { date: Date | null; key: string | null }[] = [];
    for (let i = 0; i < leading; i++) items.push({ date: null, key: null });
    for (let day = 1; day <= total; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      items.push({ date, key: toDateKey(date) });
    }
    // Pad to full weeks so the grid always ends on a Saturday.
    while (items.length % 7 !== 0) items.push({ date: null, key: null });
    return items;
  }, [viewDate]);

  const goToMonth = (delta: number) => {
    setViewDate((prev) => {
        const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
        onMonthChange?.(toDateKey(next));
        return next;
      }
    );
  };

  // Simple three-tier heatmap. Tune thresholds to taste once you see real
  // daily totals — these roughly mirror the >$30/day flag already used
  // elsewhere on the transactions page.
  const spendColor = (amount: number | undefined) => {
    if (!amount || amount <= 0) return "bg-transparent";
    if (amount > 30) return "bg-red-400";
    return "bg-emerald-400";
  };

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3 shrink-0">
        <button
          onClick={() => goToMonth(-1)}
          className="p-1.5 rounded-md hover:bg-neutral-100 active:bg-neutral-200 text-neutral-500 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-sm font-semibold text-neutral-900">
          {monthFormatter.format(viewDate)}
        </h2>
        <button
          onClick={() => goToMonth(1)}
          className="p-1.5 rounded-md hover:bg-neutral-100 active:bg-neutral-200 text-neutral-500 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center shrink-0">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-[10px] font-medium text-neutral-400 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 mt-1.5 min-h-0 overflow-y-auto p-1">
        {cells.map((cell, i) => {
          if (!cell.date || !cell.key) {
            return <div key={i} />;
          }

          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDate;
          const total = dailyTotals.get(cell.key);
          const compactCurrency = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 2,
            });
          return (
            <button
                key={i}
                onClick={() => onSelectDate?.(cell.key!)}
                className={`relative flex flex-col items-center justify-center rounded-lg w-full h-full py-1 text-xs transition-colors ${
                    isSelected
                    ? "bg-[#3D2B2E] text-white"
                    : isToday
                    ? "bg-neutral-100 text-neutral-900 ring-1 ring-neutral-300"
                    : "text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                }`}
            >
              <span
                className={`mb-1 h-1.5 w-1.5 rounded-full ${
                  isSelected ? "bg-white/70" : spendColor(total)
                }`}
              />
              <span className="tabular-nums">{cell.date.getDate()}</span>
              <span className={`mt-0.5 text-[10px] leading-none tabular-nums ${
                  isSelected ? "text-white/80" : "text-neutral-400"
                }`}>
                {total ? compactCurrency.format(total) : "\u00A0"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}