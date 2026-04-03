"use client";

import { useState, useCallback } from "react";
import { Category } from "@/lib/types";
import { addExpense, getTodayTotal, getEntries } from "@/lib/storage";
import ExpenseButtons from "@/components/ExpenseButtons";
import Charts from "@/components/Charts";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleSpend = useCallback(
    (category: Category) => {
      const entry = addExpense(category);
      if (entry) {
        setToast(`Spent ₹${entry.cost} on ${category}`);
        setTimeout(() => setToast(null), 2000);
        refresh();
      }
    },
    [refresh]
  );

  const todayTotal = getTodayTotal();
  const totalAllTime = getEntries().reduce((s, e) => s + e.cost, 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Expense Game
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Track your daily spending. Car, Phone, Laptop once per day. Food
          unlimited.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs text-white/50">Today</p>
          <p className="text-2xl font-bold text-emerald-400">₹{todayTotal}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs text-white/50">All Time</p>
          <p className="text-2xl font-bold text-white">₹{totalAllTime}</p>
        </div>
      </div>

      {/* Spend buttons */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white/80">
          Log Expense
        </h2>
        <ExpenseButtons onSpend={handleSpend} refreshKey={refreshKey} />
      </section>

      {/* Charts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white/80">
          Spending Trends & Predictions
        </h2>
        <Charts refreshKey={refreshKey} />
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
