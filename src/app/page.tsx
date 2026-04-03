"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORIES, ExpenseEntry } from "@/lib/types";
import {
  addExpense,
  fetchEntries,
  getUserCode,
  setUserCode,
  getTodayTotal,
  getTodayCount,
} from "@/lib/storage";
import ExpenseButtons from "@/components/ExpenseButtons";
import Charts from "@/components/Charts";

export default function Home() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [userCode, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [showSync, setShowSync] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ text: string; color: string } | null>(
    null
  );

  // Load user code and fetch entries on mount
  useEffect(() => {
    const code = getUserCode();
    setCode(code);
    fetchEntries(code).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const CATEGORY_COLORS: Record<Category, string> = {
    car: "#ff006e",
    phone: "#00d4ff",
    laptop: "#a855f7",
    food: "#ffbe0b",
  };

  const handleSpend = useCallback(
    async (category: Category) => {
      const entry = await addExpense(category, userCode, entries);
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
    [userCode, entries]
  );

  const handleSyncCode = useCallback(async () => {
    const code = codeInput.toUpperCase().trim();
    if (code.length !== 6) return;
    setUserCode(code);
    setCode(code);
    setLoading(true);
    const data = await fetchEntries(code);
    setEntries(data);
    setLoading(false);
    setRefreshKey((k) => k + 1);
    setShowSync(false);
    setCodeInput("");
    setToast({ text: `Synced to ${code}`, color: "#00ffaa" });
    setTimeout(() => setToast(null), 2000);
  }, [codeInput]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [userCode]);

  const todayTotal = getTodayTotal(entries);
  const totalAllTime = entries.reduce((s, e) => s + e.cost, 0);
  const todayCount = getTodayCount(entries);

  if (loading) {
    return (
      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-8 h-8 border-2 border-[#00ffaa]/30 border-t-[#00ffaa] rounded-full animate-spin"
          />
          <p
            className="text-xs tracking-[0.2em] uppercase text-white/30"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            Loading data...
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

      {/* Sync Code Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5 }}
        className="mb-8 glass-card rounded-xl p-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" strokeWidth="2" className="shrink-0">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/30" style={{ fontFamily: "var(--font-orbitron)" }}>
              Your Sync Code
            </p>
            <p
              className="text-lg font-black tracking-[0.3em] text-[#00ffaa] truncate"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              {userCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#00ffaa]/10 text-[#00ffaa] border border-[#00ffaa]/20 hover:bg-[#00ffaa]/20 transition-all"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setShowSync(!showSync)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-all"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            Sync
          </button>
        </div>
      </motion.div>

      {/* Sync input panel */}
      <AnimatePresence>
        {showSync && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-4 py-2 text-sm font-bold tracking-[0.2em] text-white placeholder-white/20 focus:outline-none focus:border-[#00d4ff]/40 uppercase"
                style={{ fontFamily: "var(--font-orbitron)" }}
              />
              <button
                onClick={handleSyncCode}
                disabled={codeInput.trim().length !== 6}
                className="px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#00d4ff] text-black hover:bg-[#00d4ff]/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                Load
              </button>
            </div>
            <p className="mt-2 text-[10px] text-white/20 text-center tracking-wider">
              Enter a sync code from another device to load its data here
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats HUD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-10 grid grid-cols-3 gap-4"
      >
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00ffaa]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
            Today
          </p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#00ffaa" }}>
            ₹{todayTotal}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
            Lifetime
          </p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#00d4ff" }}>
            ₹{totalAllTime}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
            Today&apos;s Txns
          </p>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#a855f7" }}>
            {todayCount}
          </p>
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
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40" style={{ fontFamily: "var(--font-orbitron)" }}>
            Action Pad
          </h2>
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
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40" style={{ fontFamily: "var(--font-orbitron)" }}>
            Analytics & Forecasts
          </h2>
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
            <span className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-orbitron)", color: toast.color }}>
              {toast.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
