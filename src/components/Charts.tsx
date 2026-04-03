"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DailyData } from "@/lib/types";
import {
  getWeeklyTotals,
  getMonthlyTotals,
  getDailyTotals,
} from "@/lib/storage";
import {
  predictNextValues,
  getWeeklyPrediction,
  getMonthlyPrediction,
} from "@/lib/prediction";

type View = "weekly" | "monthly";

export default function Charts({ refreshKey }: { refreshKey: number }) {
  const [view, setView] = useState<View>("weekly");

  const daily = getDailyTotals();
  const weekly = getWeeklyTotals();
  const monthly = getMonthlyTotals();

  // Build chart data with predictions
  let chartData: (DailyData & { predicted?: number })[] = [];

  if (view === "weekly") {
    const predictions = getWeeklyPrediction(weekly, 4);
    chartData = [
      ...weekly.map((w) => ({ ...w, predicted: undefined })),
      ...predictions.map((p) => ({
        ...p,
        total: 0,
        predicted: p.total,
      })),
    ];
  } else {
    const predictions = getMonthlyPrediction(monthly, 3);
    chartData = [
      ...monthly.map((m) => ({ ...m, predicted: undefined })),
      ...predictions.map((p) => ({
        ...p,
        total: 0,
        predicted: p.total,
      })),
    ];
  }

  // Also show daily prediction line
  const dailyPredictions = predictNextValues(daily, 7);

  const hasData = daily.length > 0;

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("weekly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            view === "weekly"
              ? "bg-emerald-500 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            view === "monthly"
              ? "bg-emerald-500 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Monthly
        </button>
      </div>

      {!hasData ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <p className="text-white/40">
            Start spending to see your charts here
          </p>
        </div>
      ) : (
        <>
          {/* Main spending chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-4 text-sm font-medium text-white/60">
              {view === "weekly" ? "Weekly" : "Monthly"} Spending
              {chartData.some((d) => d.predicted !== undefined) &&
                " (with prediction)"}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 12 }}
                />
                <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => [`₹${value}`, `${name}`]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ fill: "#f59e0b", r: 4 }}
                  name="Predicted"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-4 text-sm font-medium text-white/60">
              Category Breakdown ({view === "weekly" ? "Weekly" : "Monthly"})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={view === "weekly" ? weekly : monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 12 }}
                />
                <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => [`₹${value}`, `${name}`]}
                />
                <Legend />
                <Line type="monotone" dataKey="car" stroke="#ef4444" strokeWidth={2} name="Car ₹50" />
                <Line type="monotone" dataKey="phone" stroke="#3b82f6" strokeWidth={2} name="Phone ₹10" />
                <Line type="monotone" dataKey="laptop" stroke="#8b5cf6" strokeWidth={2} name="Laptop ₹20" />
                <Line type="monotone" dataKey="food" stroke="#f97316" strokeWidth={2} name="Food ₹1" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily prediction */}
          {dailyPredictions.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-4 text-sm font-medium text-white/60">
                Next 7 Days Prediction
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={[
                    ...daily.slice(-7).map((d) => ({ ...d, predicted: undefined })),
                    ...dailyPredictions.map((p) => ({
                      ...p,
                      total: 0,
                      predicted: p.total,
                    })),
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value, name) => [`₹${value}`, `${name}`]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
