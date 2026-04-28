"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

const subscribeToClient = () => () => {};

export const ProgressChartCard = ({
  data,
}: {
  data: StudentDashboardView["progressChart"];
}) => {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">График прогресса</h2>
          <p className="mt-1 text-sm text-gray-500">
            Процент верных ответов за последние дни
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50">
          8 дней
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[260px] w-full">
        {isClient ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Верных ответов"]}
              labelFormatter={(label) => `Дата: ${label}`}
            />

            <Area
              type="monotone"
              dataKey="percent"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#progressFill)"
              dot={{
                r: 4,
                fill: "#2563EB",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#2563EB",
                stroke: "#FFFFFF",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-xl bg-gray-50" />
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 rounded-full bg-blue-600" />
        Процент верных ответов
      </div>
    </section>
  );
};
