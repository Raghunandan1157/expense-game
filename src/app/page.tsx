"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORIES, ExpenseEntry } from "@/lib/types";
import {
  addExpense,
  fetchEntries,
  subscribeToChanges,
  getTodayTotal,
  getTodayCount,
} from "@/lib/storage";
import ExpenseButtons from "@/components/ExpenseButtons";
import Charts from "@/components/Charts";

export default function Home() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ text: string; color: string } | null>(null);

  const loadData = useCallback(async () => {
    const data = await fetchEntries();
    setEntries(data);
    setRefreshKey((k) => k + 1);
    setLoading(false);
  }, []);

  // Fetch on mount + subscribe to realtime changes
  useEffect(() => {
    loadData();
    const channel = subscribeToChanges(() => loadData());
    return () => { channel.unsubscribe(); };
  }, [loadData]);

  const CATEGORY_COLORS: Record<Category, string> = {
    car: "#ff006e",
    phone: "#00d4ff",
    laptop: "#a855f7",
    food: "#ffbe0b",
  };

  const handleSpend = useCallback(
    async (category: Category) => {
      const entry = await addExpense(category, entries);
      if (entry) {
        setEntries((prev) => [...prev, entry]);
        setRefreshKey((k) => k + 1);
        setToast({
          text: `- ₹${entry.cost}  ${CATEGORIES[category].emoji}  ${CATEGORIES[category].label}`,
          color: CATEGORY_COLORS[category],
        });
        setTimeout(() => setToast(null), 2000);
      }
    },
    [entries]
  );

  const todayTotal = getTodayTotal(entries);
  const totalAllTime = entries.reduce((s, e) => s + e.cost, 0);
  const todayCount = getTodayCount(entries);

  if (loading) {
    return (
      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ffaa]/30 border-t-[#00ffaa] rounded-full animate-spin" />
          <p className="text-xs tracking-[0.2em] uppercase text-white/30" style={{ fontFamily: "var(--font-orbitron)" }}>
            Loading...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-10 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-6 flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00ffaa]/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#00ffaa]/60" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00ffaa]/40" />
        </div>
        <h1
          className="text-4xl font-black tracking-[0.15em] uppercase neon-text"
          style={{ fontFamily: "var(--font-orbitron)", color: "#00ffaa" }}
        >
          Expense Game
        </h1>
        <p
          className="mt-3 text-sm font-medium tracking-[0.2em] uppercase text-white/30"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          Daily Spending Tracker
        </p>
        <div className="mx-auto mt-6 h-[1px] w-48 bg-gradient-to-r from-transparent via-[#00ffaa]/20 to-transparent" />
      </motion.div>

      {/* Stats HUD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-10 grid grid-cols-3 gap-4"
      >
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00ffaa]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>Today</p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#00ffaa" }}>₹{todayTotal}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>Lifetime</p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#00d4ff" }}>₹{totalAllTime}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>Today&apos;s Txns</p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#a855f7" }}>{todayCount}</p>
        </div>
      </motion.div>

      {/* Action Pad */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-3 w-1 rounded-full bg-[#00ffaa]" />
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40" style={{ fontFamily: "var(--font-orbitron)" }}>Action Pad</h2>
        </div>
        <ExpenseButtons onSpend={handleSpend} entries={entries} refreshKey={refreshKey} />
      </motion.section>

      {/* Analytics */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-3 w-1 rounded-full bg-[#00d4ff]" />
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40" style={{ fontFamily: "var(--font-orbitron)" }}>Analytics & Forecasts</h2>
        </div>
        <Charts refreshKey={refreshKey} entries={entries} />
      </motion.section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-8 left-1/2 z-50 glass-card rounded-xl px-6 py-3 flex items-center gap-3"
            style={{ borderColor: `${toast.color}33`, boxShadow: `0 0 30px ${toast.color}20` }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: toast.color, boxShadow: `0 0 8px ${toast.color}` }} />
            <span className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-orbitron)", color: toast.color }}>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
