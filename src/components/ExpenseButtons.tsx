"use client";

import { Category, CATEGORIES } from "@/lib/types";
import { canUseCategory, getCategoryUsagesToday } from "@/lib/storage";

interface Props {
  onSpend: (category: Category) => void;
  refreshKey: number;
}

export default function ExpenseButtons({ onSpend, refreshKey }: Props) {
  const categories = Object.entries(CATEGORIES) as [
    Category,
    (typeof CATEGORIES)[Category]
  ][];

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map(([key, cat]) => {
        const usable = canUseCategory(key);
        const usedToday = getCategoryUsagesToday(key);
        const isUnlimited = cat.limit === null;

        return (
          <button
            key={`${key}-${refreshKey}`}
            onClick={() => onSpend(key)}
            disabled={!usable}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-6 transition-all
              ${
                usable
                  ? "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "border-red-500/30 bg-red-500/5 opacity-50 cursor-not-allowed"
              }`}
          >
            <span className="text-4xl">{cat.emoji}</span>
            <span className="text-lg font-semibold text-white">{cat.label}</span>
            <span className="text-2xl font-bold text-emerald-400">
              ₹{cat.cost}
            </span>
            <span className="text-xs text-white/50">
              {isUnlimited
                ? `${usedToday} used today · unlimited`
                : usable
                ? "available today"
                : "used today"}
            </span>
            {!usable && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <span className="text-sm font-medium text-red-400">
                  Limit reached
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
