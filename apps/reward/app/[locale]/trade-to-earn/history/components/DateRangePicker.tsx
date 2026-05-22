"use client";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useState } from "react";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  label?: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  placeholder?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(d: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function getCalendarCells(year: number, month: number): (Date | null)[] {
  const first = startOfMonth(year, month);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MonthCalendar({
  year,
  month,
  range,
  onPick,
}: {
  year: number;
  month: number;
  range: DateRange;
  onPick: (d: Date) => void;
}) {
  const cells = getCalendarCells(year, month);

  return (
    <div className="flex min-w-[260px] flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-12 text-tertiary-text">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <span key={idx} />;

          const isStart = isSameDay(cell, range.start);
          const isEnd = isSameDay(cell, range.end);
          const inRange = isInRange(cell, range.start, range.end);
          const isEndpoint = isStart || isEnd;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPick(cell)}
              className={clsxMerge(
                "h-8 w-8 rounded-full text-12 duration-200",
                isEndpoint && "bg-green text-black",
                !isEndpoint && inRange && "bg-green-bg text-primary-text",
                !isEndpoint && !inRange && "text-secondary-text hocus:bg-quaternary-bg",
              )}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = "DD.MM.YYYY - DD.MM.YYYY",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6), flip()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const display =
    value.start && value.end
      ? `${formatDate(value.start)} - ${formatDate(value.end)}`
      : placeholder;

  const handlePick = (d: Date) => {
    if (!value.start || (value.start && value.end)) {
      onChange({ start: d, end: null });
    } else if (d.getTime() < value.start.getTime()) {
      onChange({ start: d, end: value.start });
    } else {
      onChange({ start: value.start, end: d });
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label ? <span className="text-12 text-secondary-text">{label}</span> : null}
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        className={clsxMerge(
          "flex h-10 w-full items-center justify-between gap-2 rounded-2 border bg-green-bg px-3 text-14 duration-200",
          isOpen
            ? "border-green text-primary-text"
            : "border-transparent text-secondary-text hocus:border-green hocus:text-primary-text",
        )}
      >
        <span className="truncate">{display}</span>
        <Svg iconName="date" size={16} className="shrink-0 text-secondary-text" />
      </button>

      {isOpen ? (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-30 max-w-[calc(100vw-24px)] overflow-x-auto rounded-3 border border-secondary-border bg-tertiary-bg p-3 shadow-2xl sm:p-4"
          >
            <div className="flex items-start gap-6">
              <div className="hidden sm:block">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="text-secondary-text duration-200 hocus:text-primary-text"
                  >
                    <Svg iconName="small-expand-arrow" className="rotate-90" size={16} />
                  </button>
                  <span className="text-14 text-primary-text">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                  <span className="w-4" />
                </div>
                <MonthCalendar
                  year={viewYear}
                  month={viewMonth}
                  range={value}
                  onPick={handlePick}
                />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="w-4" />
                  <span className="text-14 text-primary-text">
                    {MONTH_NAMES[secondMonth]} {secondYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="text-secondary-text duration-200 hocus:text-primary-text"
                  >
                    <Svg iconName="small-expand-arrow" className="-rotate-90" size={16} />
                  </button>
                </div>
                <MonthCalendar
                  year={secondYear}
                  month={secondMonth}
                  range={value}
                  onPick={handlePick}
                />
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      ) : null}
    </div>
  );
}
