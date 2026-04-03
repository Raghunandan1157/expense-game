import { ExpenseEntry, Category, CATEGORIES, DailyData } from "./types";
import { supabase } from "./supabase";

const USER_CODE_KEY = "expense-game-user-code";

// --- User code management ---

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getUserCode(): string {
  if (typeof window === "undefined") return "";
  let code = localStorage.getItem(USER_CODE_KEY);
  if (!code) {
    code = generateCode();
    localStorage.setItem(USER_CODE_KEY, code);
  }
  return code;
}

export function setUserCode(code: string) {
  localStorage.setItem(USER_CODE_KEY, code.toUpperCase().trim());
}

// --- Supabase operations ---

export async function fetchEntries(userCode: string): Promise<ExpenseEntry[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_code", userCode)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    category: row.category as Category,
    cost: row.cost,
    timestamp: row.created_at,
  }));
}

export async function addExpense(
  category: Category,
  userCode: string,
  entries: ExpenseEntry[]
): Promise<ExpenseEntry | null> {
  // Check daily limit from current entries
  if (!canUseCategory(category, entries)) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_code: userCode,
      category,
      cost: CATEGORIES[category].cost,
      created_at: now,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to add expense:", error);
    return null;
  }

  return {
    id: data.id,
    category: data.category as Category,
    cost: data.cost,
    timestamp: data.created_at,
  };
}

// --- Pure helpers (work on in-memory entries array) ---

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCategoryUsagesToday(
  category: Category,
  entries: ExpenseEntry[]
): number {
  const today = getTodayString();
  return entries.filter(
    (e) => e.category === category && e.timestamp.startsWith(today)
  ).length;
}

export function canUseCategory(
  category: Category,
  entries: ExpenseEntry[]
): boolean {
  const limit = CATEGORIES[category].limit;
  if (limit === null) return true;
  return getCategoryUsagesToday(category, entries) < limit;
}

export function getTodayTotal(entries: ExpenseEntry[]): number {
  const today = getTodayString();
  return entries
    .filter((e) => e.timestamp.startsWith(today))
    .reduce((sum, e) => sum + e.cost, 0);
}

export function getTodayCount(entries: ExpenseEntry[]): number {
  const today = getTodayString();
  return entries.filter((e) => e.timestamp.startsWith(today)).length;
}

// --- Aggregation helpers ---

export function getDailyTotals(entries: ExpenseEntry[]): DailyData[] {
  const map = new Map<string, DailyData>();
  for (const e of entries) {
    const date = e.timestamp.split("T")[0];
    if (!map.has(date)) {
      map.set(date, { date, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(date)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeeklyTotals(entries: ExpenseEntry[]): DailyData[] {
  const daily = getDailyTotals(entries);
  if (daily.length === 0) return [];
  const weeks = new Map<string, DailyData>();
  for (const d of daily) {
    const dt = new Date(d.date);
    const weekStart = new Date(dt);
    weekStart.setDate(dt.getDate() - dt.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks.has(key)) {
      weeks.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const w = weeks.get(key)!;
    w.total += d.total;
    w.car += d.car;
    w.phone += d.phone;
    w.laptop += d.laptop;
    w.food += d.food;
  }
  return Array.from(weeks.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMonthlyTotals(entries: ExpenseEntry[]): DailyData[] {
  const daily = getDailyTotals(entries);
  if (daily.length === 0) return [];
  const months = new Map<string, DailyData>();
  for (const d of daily) {
    const key = d.date.slice(0, 7);
    if (!months.has(key)) {
      months.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const m = months.get(key)!;
    m.total += d.total;
    m.car += d.car;
    m.phone += d.phone;
    m.laptop += d.laptop;
    m.food += d.food;
  }
  return Array.from(months.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMinuteTotals(entries: ExpenseEntry[]): DailyData[] {
  const map = new Map<string, DailyData>();
  for (const e of entries) {
    const dt = new Date(e.timestamp);
    const key = `${dt.toISOString().split("T")[0]} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(key)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getHourlyTotals(entries: ExpenseEntry[]): DailyData[] {
  const map = new Map<string, DailyData>();
  for (const e of entries) {
    const dt = new Date(e.timestamp);
    const key = `${dt.toISOString().split("T")[0]} ${String(dt.getHours()).padStart(2, "0")}:00`;
    if (!map.has(key)) {
      map.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(key)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
