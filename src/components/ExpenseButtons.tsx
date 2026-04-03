"use client";

import { motion } from "framer-motion";
import { Category, CATEGORIES, ExpenseEntry } from "@/lib/types";
import { canUseCategory, getCategoryUsagesToday } from "@/lib/storage";

interface Props {
  onSpend: (category: Category) => void;
  entries: ExpenseEntry[];
  refreshKey: number;
}

const NEON_COLORS: Record<Category, { color: string; glow: string; ring: string }> = {
  car: {
    color: "#ff006e",
    glow: "0 0 15px rgba(255,0,110,0.4), 0 0 45px rgba(255,0,110,0.15)",
    ring: "ring-[#ff006e]/30 hover:ring-[#ff006e]/60",
  },
  phone: {
    color: "#00d4ff",
    glow: "0 0 15px rgba(0,212,255,0.4), 0 0 45px rgba(0,212,255,0.15)",
    ring: "ring-[#00d4ff]/30 hover:ring-[#00d4ff]/60",
  },
  laptop: {
    color: "#a855f7",
    glow: "0 0 15px rgba(168,85,247,0.4), 0 0 45px rgba(168,85,247,0.15)",
    ring: "ring-[#a855f7]/30 hover:ring-[#a855f7]/60",
  },
  food: {
    color: "#ffbe0b",
    glow: "0 0 15px rgba(255,190,11,0.4), 0 0 45px rgba(255,190,11,0.15)",
    ring: "ring-[#ffbe0b]/30 hover:ring-[#ffbe0b]/60",
  },
};

export default function ExpenseButtons({ onSpend, entries, refreshKey }: Props) {
  const categories = Object.entries(CATEGORIES) as [
    Category,
    (typeof CATEGORIES)[Category]
  ][];

  return (
    <div className="grid grid-cols-2 gap-5">
      {categories.map(([key, cat], i) => {
        const usable = canUseCategory(key, entries);
        const usedToday = getCategoryUsagesToday(key, entries);
        const isUnlimited = cat.limit === null;
        const neon = NEON_COLORS[key];

        return (
          <motion.button
            key={`${key}-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            whileHover={usable ? { scale: 1.03, boxShadow: neon.glow } : {}}
            whileTap={usable ? { scale: 0.97 } : {}}
            onClick={() => usable && onSpend(key)}
            disabled={!usable}
            className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 ring-1 transition-all duration-300
              glass-card overflow-hidden
              ${usable ? `cursor-pointer ${neon.ring}` : "opacity-40 cursor-not-allowed ring-white/5"}`}
            style={{ fontFamily: "var(--font-rajdhani)" }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-4 right-4 h-[1px] opacity-60 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(90deg, transparent, ${neon.color}, transparent)`,
              }}
            />

            {/* Corner decorators */}
            <div
              className="absolute top-2 left-2 w-2 h-2 opacity-30"
              style={{ borderTop: `1px solid ${neon.color}`, borderLeft: `1px solid ${neon.color}` }}
            />
            <div
              className="absolute top-2 right-2 w-2 h-2 opacity-30"
              style={{ borderTop: `1px solid ${neon.color}`, borderRight: `1px solid ${neon.color}` }}
            />
            <div
              className="absolute bottom-2 left-2 w-2 h-2 opacity-30"
              style={{ borderBottom: `1px solid ${neon.color}`, borderLeft: `1px solid ${neon.color}` }}
            />
            <div
              className="absolute bottom-2 right-2 w-2 h-2 opacity-30"
              style={{ borderBottom: `1px solid ${neon.color}`, borderRight: `1px solid ${neon.color}` }}
            />

            <span className="text-4xl drop-shadow-lg">{cat.emoji}</span>

            <span
              className="text-lg font-bold tracking-wide uppercase"
              style={{ fontFamily: "var(--font-orbitron)", color: neon.color }}
            >
              {cat.label}
            </span>

            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-black"
                style={{ fontFamily: "var(--font-orbitron)", color: neon.color }}
              >
                ₹{cat.cost}
              </span>
            </div>

            <span className="text-xs font-medium tracking-wider text-white/40 uppercase">
              {isUnlimited
                ? `${usedToday} used · unlimited`
                : usable
                ? "1 remaining"
                : "depleted"}
            </span>

            {/* Disabled overlay */}
            {!usable && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff006e" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-orbitron)", color: "#ff006e" }}
                  >
                    Locked
                  </span>
                </div>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
