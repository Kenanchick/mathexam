"use client";

import { useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

type WeeklyPoint = {
  date: string;
  value: number;
};

type Props = {
  compact?: boolean;
};

const subscribeToClient = () => () => {};

const data: WeeklyPoint[] = [
  { date: "15.04", value: 22 },
  { date: "22.04", value: 34 },
  { date: "29.04", value: 31 },
  { date: "06.05", value: 46 },
  { date: "13.05", value: 60 },
  { date: "20.05", value: 68 },
  { date: "27.05", value: 82 },
];

function WeeklyTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload.length === 0) return null;

  const d = payload[0]?.payload as WeeklyPoint;

  if (!d) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs shadow-md">
      <div className="font-medium text-gray-900">{d.date}</div>
      <div className="mt-0.5 font-semibold text-blue-600">{d.value}%</div>
    </div>
  );
}

export const WeeklyResults = ({ compact = false }: Props) => {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const tickFontSize = compact ? 10 : 12;
  const yAxisWidth = compact ? 40 : 48;

  return (
    <div
      className={`flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-between ${
          compact ? "mb-2" : "mb-4"
        }`}
      >
        <h3 className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>
          Результаты по неделям
        </h3>

        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-md border text-gray-500 ${
            compact ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
          }`}
        >
          <span>7 недель</span>
          <ChevronDown
            className={`shrink-0 text-gray-400 ${
              compact ? "size-3" : "size-4"
            }`}
            strokeWidth={2}
          />
        </button>
      </div>

      <div
        className={
          compact
            ? "min-h-[145px] flex-1 w-full"
            : "min-h-[220px] flex-1 w-full"
        }
      >
        {isClient ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={data}
            margin={
              compact
                ? { top: 8, right: 8, left: 4, bottom: 4 }
                : { top: 12, right: 10, left: 6, bottom: 8 }
            }
          >
            <defs>
              <linearGradient id="weeklyAreaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#e5e7eb" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: tickFontSize, fill: "#6b7280" }}
              dy={compact ? 2 : 6}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => (v === 100 ? "100%" : `${v}`)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: tickFontSize, fill: "#6b7280" }}
              width={yAxisWidth}
            />

            <Tooltip
              content={WeeklyTooltip}
              cursor={{
                stroke: "#93c5fd",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              allowEscapeViewBox={{ x: true, y: true }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#weeklyAreaBlue)"
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={compact ? 2 : 3}
              dot={{
                r: compact ? 3 : 5,
                fill: "white",
                stroke: "#2563eb",
                strokeWidth: compact ? 2 : 3,
              }}
              activeDot={{
                r: compact ? 4 : 6,
                fill: "white",
                stroke: "#2563eb",
                strokeWidth: compact ? 2 : 3,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-xl bg-gray-50" />
        )}
      </div>
    </div>
  );
};
