"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { DailyData } from "@/lib/types";
import {
  getWeeklyTotals,
  getMonthlyTotals,
  getDailyTotals,
  getMinuteTotals,
  getHourlyTotals,
} from "@/lib/storage";
import {
  predictNextValues,
  getWeeklyPrediction,
  getMonthlyPrediction,
} from "@/lib/prediction";

type View = "minute" | "hour" | "weekly" | "monthly";

const tooltipStyle = {
  background: "rgba(5, 8, 15, 0.95)",
  border: "1px solid rgba(0, 255, 170, 0.15)",
  borderRadius: "12px",
  color: "#e0e6f0",
  fontFamily: "var(--font-rajdhani)",
  fontSize: "14px",
  padding: "10px 14px",
  boxShadow: "0 0 20px rgba(0, 255, 170, 0.1)",
};

const axisTickStyle = { fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "var(--font-orbitron)" };

const VIEW_META: Record<View, { label: string; color: string }> = {
  minute: { label: "Min", color: "#ff006e" },
  hour: { label: "Hour", color: "#a855f7" },
  weekly: { label: "Week", color: "#00ffaa" },
  monthly: { label: "Month", color: "#00d4ff" },
};

function ChartCard({
  title,
  badge,
  children,
  delay = 0,
  accentColor = "#00ffaa",
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
  accentColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-6 right-6 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}4D, transparent)`,
        }}
      />

      <div className="flex items-center gap-3 mb-5">
        <h3
          className="text-sm font-bold tracking-[0.2em] uppercase text-white/50"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          {title}
        </h3>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ffbe0b]/10 text-[#ffbe0b] border border-[#ffbe0b]/20">
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function formatLabel(date: string, view: View): string {
  if (view === "minute") {
    // "2026-04-03 14:32" → "14:32"
    return date.split(" ")[1] || date;
  }
  if (view === "hour") {
    // "2026-04-03 14:00" → "14:00"
    return date.split(" ")[1] || date;
  }
  if (view === "monthly") {
    return date; // YYYY-MM
  }
  // weekly — show date
  return date.slice(5); // MM-DD
}

export default function Charts({ refreshKey }: { refreshKey: number }) {
  const [view, setView] = useState<View>("minute");

  const daily = getDailyTotals();
  const weekly = getWeeklyTotals();
  const monthly = getMonthlyTotals();
  const minuteData = getMinuteTotals();
  const hourlyData = getHourlyTotals();

  const activeColor = VIEW_META[view].color;

  // Get data for the selected view
  function getViewData(): DailyData[] {
    switch (view) {
      case "minute":
        return minuteData;
      case "hour":
        return hourlyData;
      case "weekly":
        return weekly;
      case "monthly":
        return monthly;
    }
  }

  // Build chart data with predictions (only for weekly/monthly)
  let chartData: (DailyData & { predicted?: number })[] = [];
  const viewData = getViewData();

  if (view === "weekly") {
    const predictions = getWeeklyPrediction(weekly, 4);
    chartData = [
      ...weekly.map((w) => ({ ...w, predicted: undefined })),
      ...predictions.map((p) => ({ ...p, total: 0, predicted: p.total })),
    ];
  } else if (view === "monthly") {
    const predictions = getMonthlyPrediction(monthly, 3);
    chartData = [
      ...monthly.map((m) => ({ ...m, predicted: undefined })),
      ...predictions.map((p) => ({ ...p, total: 0, predicted: p.total })),
    ];
  } else {
    // Minute / Hour — show recent data, no prediction
    chartData = viewData.map((d) => ({ ...d, predicted: undefined }));
  }

  // Format labels for display
  const displayData = chartData.map((d) => ({
    ...d,
    label: formatLabel(d.date, view),
  }));

  const dailyPredictions = predictNextValues(daily, 7);
  const hasData = daily.length > 0;

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* View toggle — 4 tabs */}
      <div className="flex gap-1.5 p-1 glass-card rounded-xl w-fit">
        {(["minute", "hour", "weekly", "monthly"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`relative rounded-lg px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300
              ${
                view === v
                  ? ""
                  : "text-white/30 hover:text-white/60"
              }`}
            style={{
              fontFamily: "var(--font-orbitron)",
              color: view === v ? VIEW_META[v].color : undefined,
            }}
          >
            {view === v && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `${VIEW_META[v].color}15`,
                  border: `1px solid ${VIEW_META[v].color}33`,
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{VIEW_META[v].label}</span>
          </button>
        ))}
      </div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-72 flex-col items-center justify-center gap-4 glass-card rounded-2xl"
        >
          <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,170,0.3)" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-white/25 text-sm tracking-wider uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>
            Awaiting data input
          </p>
          <p className="text-white/15 text-xs">Log expenses above to generate analytics</p>
        </motion.div>
      ) : (
        <>
          {/* Main spending chart */}
          <ChartCard
            title={`${VIEW_META[view].label} Spending`}
            badge={chartData.some((d) => d.predicted !== undefined) ? "AI Forecast" : undefined}
            delay={0.1}
            accentColor={activeColor}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="gradMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={activeColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffbe0b" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ffbe0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" stroke="transparent" tick={axisTickStyle} />
                <YAxis stroke="transparent" tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`₹${value}`, `${name}`]} />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-orbitron)", fontSize: 10, letterSpacing: "0.1em" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={activeColor}
                  strokeWidth={2}
                  fill="url(#gradMain)"
                  dot={{ fill: activeColor, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: activeColor, stroke: "#05080f", strokeWidth: 2 }}
                  name="Actual"
                />
                {(view === "weekly" || view === "monthly") && (
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ffbe0b"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    fill="url(#gradPred)"
                    dot={{ fill: "#ffbe0b", r: 3, strokeWidth: 0 }}
                    name="Predicted"
                    connectNulls={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category breakdown */}
          <ChartCard title="Category Breakdown" delay={0.2} accentColor={activeColor}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={viewData.map((d) => ({ ...d, label: formatLabel(d.date, view) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" stroke="transparent" tick={axisTickStyle} />
                <YAxis stroke="transparent" tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`₹${value}`, `${name}`]} />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-orbitron)", fontSize: 10, letterSpacing: "0.1em" }}
                />
                <Line type="monotone" dataKey="car" stroke="#ff006e" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "#ff006e" }} name="Car ₹50" />
                <Line type="monotone" dataKey="phone" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "#00d4ff" }} name="Phone ₹10" />
                <Line type="monotone" dataKey="laptop" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "#a855f7" }} name="Laptop ₹20" />
                <Line type="monotone" dataKey="food" stroke="#ffbe0b" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "#ffbe0b" }} name="Food ₹1" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Daily prediction — only show when on weekly/monthly view */}
          {dailyPredictions.length > 0 && (view === "weekly" || view === "monthly") && (
            <ChartCard title="7-Day Forecast" badge="Predictive" delay={0.3}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={[
                    ...daily.slice(-7).map((d) => ({ ...d, predicted: undefined })),
                    ...dailyPredictions.map((p) => ({ ...p, total: 0, predicted: p.total })),
                  ]}
                >
                  <defs>
                    <linearGradient id="gradGreen2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffaa" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#00ffaa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" stroke="transparent" tick={axisTickStyle} />
                  <YAxis stroke="transparent" tick={axisTickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`₹${value}`, `${name}`]} />
                  <Legend
                    wrapperStyle={{ fontFamily: "var(--font-orbitron)", fontSize: 10, letterSpacing: "0.1em" }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#00ffaa" strokeWidth={2} fill="url(#gradGreen2)" name="Actual" />
                  <Area type="monotone" dataKey="predicted" stroke="#ffbe0b" strokeWidth={2} strokeDasharray="6 4" fill="url(#gradPred)" name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}
